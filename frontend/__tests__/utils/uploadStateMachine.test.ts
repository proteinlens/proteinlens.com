import { describe, it, expect, beforeEach } from 'vitest';
import { uploadReducer, type UploadState } from '@/utils/uploadStateMachine';

describe('uploadStateMachine', () => {
  let initialState: UploadState;

  beforeEach(() => {
    initialState = {
      state: 'idle',
      file: null,
      progress: 0,
      blobUrl: null,
      mealId: null,
      analysis: null,
      error: null,
    };
  });

  describe('state transitions', () => {
    it('should transition from idle to selected when file selected', () => {
      const file = new File(['test'], 'meal.jpg', { type: 'image/jpeg' });
      const newState = uploadReducer(initialState, { type: 'SELECT', file });
      
      expect(newState.state).toBe('selected');
      expect(newState.file).toBe(file);
      expect(newState.error).toBeNull();
    });

    it('should transition from selected to uploading', () => {
      initialState.state = 'selected' as any;
      const newState = uploadReducer(initialState, { type: 'UPLOAD_START' });
      
      expect(newState.state).toBe('uploading');
      expect(newState.progress).toBe(0);
    });

    it('should update progress during upload', () => {
      initialState.state = 'uploading' as any;
      const newState = uploadReducer(initialState, {
        type: 'UPLOAD_PROGRESS',
        progress: 50,
      });
      
      expect(newState.state).toBe('uploading');
      expect(newState.progress).toBe(50);
    });

    it('should transition from uploading to analyzing when upload completes', () => {
      initialState.state = 'uploading' as any;
      const newState = uploadReducer(initialState, {
        type: 'UPLOAD_COMPLETE',
        blobUrl: 'blob-url-123',
      });
      
      expect(newState.state).toBe('analyzing');
      expect(newState.blobUrl).toBe('blob-url-123');
    });

    it('should transition from analyzing to done when analysis completes', () => {
      initialState.state = 'analyzing' as any;
      const mockAnalysis = {
        foods: [{ id: '1', name: 'Chicken', proteinGrams: 25, confidence: 95, aiDetected: true, isEdited: false }],
        totalProtein: 25,
      };
      const newState = uploadReducer(initialState, {
        type: 'ANALYZE_COMPLETE',
        mealId: 'meal-123',
        analysis: mockAnalysis,
      });
      
      expect(newState.state).toBe('done');
      expect(newState.analysis).toEqual(mockAnalysis);
      expect(newState.mealId).toBe('meal-123');
    });

    it('should transition to error state on upload error', () => {
      initialState.state = 'uploading' as any;
      const newState = uploadReducer(initialState, {
        type: 'ERROR',
        error: 'Upload failed',
      });
      
      expect(newState.state).toBe('error');
      expect(newState.error).toBe('Upload failed');
    });

    it('should transition from error back to idle on retry', () => {
      initialState.state = 'error' as any;
      initialState.error = 'Upload failed';
      const newState = uploadReducer(initialState, { type: 'RETRY' });
      
      expect(newState.state).toBe('selected');
      expect(newState.error).toBeNull();
    });

    it('should reset to idle state', () => {
      initialState.state = 'done' as any;
      initialState.file = new File([], 'test.jpg');
      initialState.blobUrl = 'blob-url';
      initialState.analysis = { foods: [], totalProtein: 0 };
      
      const newState = uploadReducer(initialState, { type: 'RESET' });
      
      expect(newState.state).toBe('idle');
      expect(newState.file).toBeNull();
      expect(newState.blobUrl).toBeNull();
      expect(newState.analysis).toBeNull();
      expect(newState.error).toBeNull();
      expect(newState.progress).toBe(0);
    });
  });

  describe('invalid state transitions', () => {
    it('should prevent selecting file during upload', () => {
      initialState.state = 'uploading' as any;
      const file = new File(['test'], 'meal.jpg', { type: 'image/jpeg' });
      
      const newState = uploadReducer(initialState, { type: 'SELECT', file });
      
      // Should reset and select
      expect(newState.state).toBe('selected');
      expect(newState.file).toBe(file);
    });
  });

  describe('payload handling', () => {
    it('should handle null error message', () => {
      initialState.state = 'uploading' as any;
      const newState = uploadReducer(initialState, {
        type: 'ERROR',
        error: null as any,
      });
      
      expect(newState.state).toBe('error');
      expect(newState.error).toBeNull();
    });

    it('should preserve file when transitioning states', () => {
      const file = new File(['test'], 'meal.jpg', { type: 'image/jpeg' });
      const stateWithFile: any = {
        state: 'selected',
        file,
        progress: 0,
        blobUrl: null,
        mealId: null,
        analysis: null,
        error: null,
      };
      
      const newState = uploadReducer(stateWithFile, { type: 'UPLOAD_START' });
      
      expect(newState.file).toBe(file);
    });
  });
});
