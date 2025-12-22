export type UploadState = 'idle' | 'selected' | 'uploading' | 'analyzing' | 'done' | 'error'

export type UploadAction = 
  | { type: 'SELECT'; file: File }
  | { type: 'UPLOAD_START' }
  | { type: 'UPLOAD_PROGRESS'; progress: number }
  | { type: 'UPLOAD_COMPLETE'; blobUrl: string }
  | { type: 'ANALYZE_START' }
  | { type: 'ANALYZE_COMPLETE'; mealId: string; analysis: any }
  | { type: 'ERROR'; error: string }
  | { type: 'RETRY' }
  | { type: 'RESET' }

export interface UploadStateData {
  state: UploadState
  file: File | null
  progress: number
  blobUrl: string | null
  mealId: string | null
  analysis: any | null
  error: string | null
}

const initialState: UploadStateData = {
  state: 'idle',
  file: null,
  progress: 0,
  blobUrl: null,
  mealId: null,
  analysis: null,
  error: null,
}

export function uploadReducer(
  state: UploadStateData = initialState,
  action: UploadAction
): UploadStateData {
  switch (action.type) {
    case 'SELECT':
      return {
        ...initialState,
        state: 'selected',
        file: action.file,
      }

    case 'UPLOAD_START':
      if (state.state !== 'selected') return state
      return {
        ...state,
        state: 'uploading',
        error: null,
      }

    case 'UPLOAD_PROGRESS':
      if (state.state !== 'uploading') return state
      return {
        ...state,
        progress: action.progress,
      }

    case 'UPLOAD_COMPLETE':
      if (state.state !== 'uploading') return state
      return {
        ...state,
        state: 'analyzing',
        blobUrl: action.blobUrl,
        progress: 100,
      }

    case 'ANALYZE_START':
      if (state.state !== 'analyzing') return state
      return {
        ...state,
        state: 'analyzing',
      }

    case 'ANALYZE_COMPLETE':
      if (state.state !== 'analyzing') return state
      return {
        ...state,
        state: 'done',
        mealId: action.mealId,
        analysis: action.analysis,
      }

    case 'ERROR':
      return {
        ...state,
        state: 'error',
        error: action.error,
      }

    case 'RETRY':
      if (state.state !== 'error') return state
      return {
        ...state,
        state: 'selected',
        error: null,
        progress: 0,
      }

    case 'RESET':
      return initialState

    default:
      return state
  }
}
