import { useReducer, useCallback } from 'react';
import { uploadReducer } from '@/utils/uploadStateMachine';
const initialState = {
    state: 'idle',
    file: null,
    progress: 0,
    blobUrl: null,
    mealId: null,
    analysis: null,
    error: null,
};
export function useUpload() {
    const [state, dispatch] = useReducer(uploadReducer, initialState);
    const selectFile = useCallback((file) => {
        dispatch({ type: 'SELECT', file });
    }, []);
    const startUpload = useCallback(() => {
        dispatch({ type: 'UPLOAD_START' });
    }, []);
    const updateProgress = useCallback((progress) => {
        dispatch({ type: 'UPLOAD_PROGRESS', progress });
    }, []);
    const completeUpload = useCallback((blobUrl) => {
        dispatch({ type: 'UPLOAD_COMPLETE', blobUrl });
    }, []);
    const startAnalyze = useCallback(() => {
        dispatch({ type: 'ANALYZE_START' });
    }, []);
    const completeAnalyze = useCallback((mealId, analysis) => {
        dispatch({ type: 'ANALYZE_COMPLETE', mealId, analysis });
    }, []);
    const setError = useCallback((error) => {
        dispatch({ type: 'ERROR', error });
    }, []);
    const retry = useCallback(() => {
        dispatch({ type: 'RETRY' });
    }, []);
    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);
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
    };
}
