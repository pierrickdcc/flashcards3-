
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { DataSyncProvider, useDataSync } from './DataSyncContext';
import { AuthProvider } from './AuthContext';
import { db } from '../db';
import { supabase } from '../supabaseClient';

// Mock Dexie
vi.mock('../db', () => ({
  db: {
    cards: {
      add: vi.fn(),
      toArray: vi.fn().mockResolvedValue([]),
    },
    deletionsPending: {
      add: vi.fn(),
    },
  },
}));

// Mock Supabase
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  value: true,
});

const TestComponent = () => {
  const dataSync = useDataSync();
  return <button onClick={() => dataSync.addCard({ question: 'Q1', answer: 'A1', subject: 'S1' })}>Add Card</button>;
};

describe('DataSyncContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('offline-to-online: should add a card locally when offline and sync when online', async () => {
    // 1. Start offline
    Object.defineProperty(navigator, 'onLine', { value: false });

    const { getByText } = render(
      <AuthProvider>
        <DataSyncProvider>
          <TestComponent />
        </DataSyncProvider>
      </AuthProvider>
    );

    // 2. Add a card
    await act(async () => {
      getByText('Add Card').click();
    });

    // 3. Verify it was added to Dexie with isSynced: false
    expect(db.cards.add).toHaveBeenCalledWith(expect.objectContaining({
      question: 'Q1',
      answer: 'A1',
      subject: 'S1',
      isSynced: false,
    }));

    // 4. Verify syncToCloud was NOT called
    expect(supabase.from).not.toHaveBeenCalled();

    // 5. Go online
    Object.defineProperty(navigator, 'onLine', { value: true });
    window.dispatchEvent(new Event('online'));

    // 6. Verify syncToCloud was called
    // We need to wait for the effect to run
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(supabase.from).toHaveBeenCalledWith('flashcards');
  });
});
