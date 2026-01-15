// Step 2 of the River Auth Pipedream workflow
// Purpose: Validate incoming claim request and extract required fields

export default defineComponent({
    async run({ steps, $ }) {
      const evt = steps.trigger.event || {};
      
      // Handle the double-nested body structure that Pipedream creates
      let body = evt.body;
      
      // If body has a nested body property, use that
      if (body && body.body) {
        body = body.body;
      }
      
      // Parse if string (sometimes Pipedream sends stringified JSON)
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          throw new Error('Invalid JSON in request body');
        }
      }
      
      body = body || {};
      
      // Extract required fields
      const anonymousSessionId = body.anonymous_session_id;
      const userId = body.user_id;
      
      // Validate both fields are present
      if (!anonymousSessionId || !userId) {
        throw new Error('Missing required fields: anonymous_session_id and user_id');
      }
      
      // Log summary for Pipedream UI
      $.export('summary', `Claiming generations for session ${anonymousSessionId} → user ${userId}`);
      
      // Return validated data for next step
      return {
        anonymousSessionId,
        userId
      };
    }
  });