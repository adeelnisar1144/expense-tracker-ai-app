
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User, Checkpoint } from '../types';
import Modal from './Modal';
import Button from './common/Button';
import Input from './common/Input';
import { History, Trash2, RotateCcw, Plus, Save } from 'lucide-react';

interface CheckpointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const CheckpointsModal: React.FC<CheckpointsModalProps> = ({ isOpen, onClose, user }) => {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCheckpoints();
    }
  }, [isOpen]);

  const loadCheckpoints = async () => {
    const data = await api.getCheckpoints(user.email);
    setCheckpoints(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsLoading(true);
    try {
      const updated = await api.createCheckpoint(user.email, newName.trim());
      setCheckpoints(updated);
      setNewName('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this snapshot?")) return;
    const updated = await api.deleteCheckpoint(user.email, id);
    setCheckpoints(updated);
  };

  const handleRestore = async (checkpoint: Checkpoint) => {
    if (!window.confirm(`Restore to "${checkpoint.name}"? Current unsaved data will be lost.`)) return;
    await api.restoreBackup(user.email, checkpoint.data);
    alert("Snapshot restored! App will reload.");
    window.location.reload();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Financial Snapshots">
      <div className="space-y-6">
        <form onSubmit={handleCreate} className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-600 mb-2">Save New Snapshot</label>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., Before Holiday Shopping" 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !newName.trim()} className="flex items-center gap-2">
              <Save size={18} /> Save
            </Button>
          </div>
        </form>

        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <History size={16} /> Saved Points
          </h3>
          {checkpoints.length === 0 ? (
            <p className="text-center py-8 text-gray-500 italic">No snapshots saved yet.</p>
          ) : (
            checkpoints.map(cp => (
              <div key={cp.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-bold text-gray-800">{cp.name}</p>
                  <p className="text-xs text-gray-400">{new Date(cp.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleRestore(cp)}
                    className="p-2 text-brand-primary hover:bg-blue-50 rounded-full transition-colors"
                    title="Restore this snapshot"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cp.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CheckpointsModal;
