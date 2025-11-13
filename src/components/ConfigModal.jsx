
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDataSync } from '../context/DataSyncContext';
import { db } from '../db';
import ModalWrapper from './ModalWrapper';

const ConfigModal = ({ show, onClose }) => {
  const { workspaceId, setWorkspaceId } = useAuth();
  const { syncToCloud } = useDataSync();
  const [localWorkspaceId, setLocalWorkspaceId] = useState(workspaceId);

  const handleSave = async () => {
    if (localWorkspaceId !== workspaceId) {
      setWorkspaceId(localWorkspaceId);
      await db.delete();
      await db.open();
      syncToCloud();
    }
    onClose();
  };

  return (
    <ModalWrapper isOpen={show} onClose={onClose} title="Configuration">
      <div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Workspace ID
          </label>
          <input
            type="text"
            value={localWorkspaceId}
            onChange={(e) => setLocalWorkspaceId(e.target.value)}
            placeholder="mon-groupe-revision"
            className="mt-2 w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Changer de Workspace ID videra vos données locales et synchronisera
            avec le nouveau groupe.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Enregistrer
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Annuler
        </button>
      </div>
    </ModalWrapper>
  );
};

export default ConfigModal;
