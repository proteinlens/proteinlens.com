import { useReducer, useCallback } from 'react'
import { uploadReducer, type UploadStateData, type UploadAction } from '@/utils/uploadStateMachine'

const initialState: UploadStateData = {
  state: 'idle',
  file: null,
  progress: 0,
  blobUrl: null,
  mealId: null,
  analysis: null,
  error: null,
}

export function useUpload() {
  const [state, dispatch] = useReducer(uploadReducer, initialState)

  const selectFile = useCallback((file: File) => {
    dispatch({ type: 'SELECT', file } as UploadAction)
  }, [])

  const startUpload = useCallback(() => {
    dispatch({ type: 'UPLOAD_START' } as UploadAction)
  }, [])

  const updateProgress = useCallback((progress: number) => {
    dispatch({ type: 'UPLOAD_PROGRESS', progress } as UploadAction)
  }, [])

  const completeUpload = useCallback((blobUrl: string) => {
    dispatch({ type: 'UPLOAD_COMPLETE', blobUrl } as UploadAction)
  }, [])

  const startAnalyze = useCallback(() => {
    dispatch({ type: 'ANALYZE_START' } as UploadAction)
  }, [])

  const completeAnalyze = useCallback((mealId: string, analysis: any) => {
    dispatch({ type: 'ANALYZE_COMPLETE', mealId, analysis } as UploadAction)
  }, [])

  const setError = useCallback((error: string) => {
    dispatch({ type: 'ERROR', error } as UploadAction)
  }, [])

  const retry = useCallback(() => {
    dispatch({ type: 'RETRY' } as UploadAction)
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' } as UploadAction)
  }, [])

  return {
    state,
    dispatch,
    selectFile,
    startUpload,
    updateProgress,
    completeUpload,
    startAnalyze,
    completeAnalyze,
    setError,
    retry,
    reset,
  }
}
