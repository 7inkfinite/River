import * as React from "react"
import { RiverProvider } from "./UseRiverGeneration.tsx"
import { RiverCTA } from "./RiverCTA.tsx"
import { RiverResultsRoot } from "./RiverResultsRoot.tsx"

export function RiverAppRoot() {
    return (
        <RiverProvider>
            <RiverCTA />
            <RiverResultsRoot />
        </RiverProvider>
    )
}
