import { useMessage } from "naive-ui"
import { Inject } from "../../preload/type"
declare global {
  interface Window extends Inject {
    $message: ReturnType<typeof useMessage>
  }
}

export interface KnownTags {
  anthor: Record<string, number>
  character: Record<string, Set<string>>
  origin: Record<string, number>
}
