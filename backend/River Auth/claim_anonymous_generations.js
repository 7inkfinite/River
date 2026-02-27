// Pipedream Webhook: Claim Anonymous Generations
// Purpose: Migrate anonymous generations to authenticated user
// Method: POST
// URL: https://YOUR_CLAIM_WEBHOOK.m.pipedream.net

import { createClient } from "@supabase/supabase-js"

export default defineComponent({
  async run({ steps, $ }) {
    // 1. Get input from request body
    let body = steps.trigger.event.body;
    if (body && typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { /* leave as-is */ }
    }
    if (body && body.body && typeof body.body === "object") {
      body = body.body;
    }

    const { anonymous_session_id, user_id } = body;

    // 2. Validate required fields
    if (!anonymous_session_id || !user_id) {
      $.respond({
        status: 400,
        body: {
          error: "Missing required fields",
          details: "Both anonymous_session_id and user_id are required"
        }
      })
      return
    }

    // 3. Initialize Supabase with SERVICE ROLE KEY (bypasses RLS)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    try {
      // 4. Update videos table - claim anonymous videos
      const { data: videos, error: videosError } = await supabase
        .from("videos")
        .update({
          user_id: user_id,
          anonymous_session_id: null
        })
        .eq("anonymous_session_id", anonymous_session_id)
        .is("user_id", null)
        .select()

      if (videosError) {
        console.error("❌ Videos update error:", videosError)
        throw videosError
      }

      console.log(`✅ Claimed ${videos?.length || 0} videos`)

      // 5. Update generations table - claim anonymous generations
      const { data: generations, error: gensError } = await supabase
        .from("generations")
        .update({
          user_id: user_id,
          anonymous_session_id: null
        })
        .eq("anonymous_session_id", anonymous_session_id)
        .is("user_id", null)
        .select()

      if (gensError) {
        console.error("❌ Generations update error:", gensError)
        throw gensError
      }

      console.log(`✅ Claimed ${generations?.length || 0} generations`)

      // 6. Return success response
      const claimed = {
        videos: videos?.length || 0,
        generations: generations?.length || 0
      }

      $.respond({
        status: 200,
        body: {
          success: true,
          claimed: claimed,
          message: `Successfully claimed ${claimed.videos} video(s) and ${claimed.generations} generation(s)`
        }
      })

      return {
        success: true,
        videos_claimed: claimed.videos,
        generations_claimed: claimed.generations
      }

    } catch (error) {
      // 7. Handle errors
      console.error("❌ Claim error:", error)
      $.respond({
        status: 500,
        body: {
          error: "Failed to claim anonymous generations",
          details: error.message
        }
      })

      throw error
    }
  }
})
