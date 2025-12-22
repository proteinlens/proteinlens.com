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
      const newState = uploadReducer(initialState, { type: 'SELECT', payload: file });
      
      expect(newState.state).toBe('selected');
      expect(newState.file).toBe(file);
      expect(newState.error).toBeNull();
    });

    it('should transition from selected to uploading', () => {
      initialState.state = 'selected';
      const newState = uploadReducer(initialState, { type: 'UPLOAD_START' });
      
      expect(newState.state).toBe('uploading');
      expect(newState.progress).toBe(0);
    });

    it('should update progress during upload', () => {
      initialState.state = 'uploading';
      const newState = uploadReducer(initialState, {
        type: 'UPLOAD_PROGRESS',
        payload: 50,
      });
      
      expect(newState.state).toBe('uploading');
      expect(newState.progress).toBe(50);
    });

    it('should transition from uploading to analyzing when upload completes', () => {
      initialState.state = 'uploading';
      const newState = uploadReducer(initialState, {
        type: 'UPLOAD_COMPLETE',
        payload: 'blob-url-123',
      });
      
      expect(newState.state).toBe('analyzing');
      expect(newState.blobUrl).toBe('blob-url-123');
    });

    it('should transition from analyzing to done when analysis completes', () => {
      initialState.state = 'analyzing';
      const mockAnalysis = {
        foods: [{ id: '1', name: 'Chicken', proteinGrams: 25, confidence: 95, aiDetected: true, isEdited: false }],
        totalProtein: 25,
      };
      const newState = uploadReducer(initialState, {
        type: 'ANALYZE_COMPLETE',
        payload: { analysis: mockAnalysis, mealId: 'meal-123' },
      });
      
      expect(newState.state).toBe('done');
      expect(newState.analysis).toEqual(mockAnalysis);
      expect(newState.mealId).toBe('meal-123');
    });

    it('should transition to error state on upload error', () => {
      initialState.state = 'uploading';
      const newState = uploadReducer(initialState, {
        type: 'ERROR',
        payload: 'Upload failed',
      });
      
      expect(newState.state).toBe('error');
      expect(newState.error).toBe('Upload failed');
    });

    it('should transition from error back to idle on retry', () => {
      initialState.state = 'error';
      initialState.error = 'Upload failed';
      const newState = uploadReducer(initialState, { type: 'RETRY' });
      
      expect(newState.state).toBe('idle');
      expect(newState.error).toBeNull();
      expect(newState.file).toBeNull();
    });

    it('should reset to idle state', () => {
      initialState.state = 'done';
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
    it('should prevent analyzing before upload completes', () => {
      initialState.state = 'uploading';
      
      const newState = uploadReducer(initialState, { type: 'ANALYZE_COMPLETE', payload: {} });
      
      // Should stay in uploading state or error
      expect(newState.state).toBe('uploading');
    });

    it('should prevent selecting file during upload', () => {
      initialState.state = 'uploading';
      const file = new File(['test'], 'meal.jpg', { type: 'image/jpeg' });
      
      const newState = uploadReducer(initialState, { type: 'SELECT', payload: file });
      
      // Should stay in uploading state
      expect(newState.state).toBe('uploading');
    });
  });

  describe('payload handling', () => {
    it('should handle null error message', () => {
      initialState.state = 'uploading';
      const newState = uploadReducer(initialState, {
        type: 'ERROR',
        payload: null,
      });
      
      expect(newState.state).toBe('error');
      expect(newState.error).toBeNull();
    });

    it('should preserve file when transitioning states', () => {
      const file = new File(['test'], 'meal.jpg', { type: 'image/jpeg' });
      initialState.state = 'idle';
      initialState.file = file;
      
      const newState = uploadReducer(initialState, { type: 'UPLOAD_START' });
      
      expect(newState.file).toBe(file);
    });
  });
});
