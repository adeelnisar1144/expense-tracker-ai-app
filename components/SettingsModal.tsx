
import React, { useRef } from 'react';
import { api } from '../api';
import { User, SUPPORTED_CURRENCIES, Settings, SUPPORTED_LANGUAGES } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import Modal from './Modal';
import Button from './common/Button';
import Select from './common/Select';
import { Download, Upload, History } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onOpenCheckpoints?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onOpenCheckpoints }) => {
  const { settings, updateSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    try {
        const data = await api.getDashboardData(user.email);
        const backupData = {
            expenses: data.expenses,
            budgets: data.budgets,
            savingsGoals: data.savingsGoals,
            settings: settings,
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(backupData, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `budgetflow_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    } catch (error) {
        console.error("Failed to create backup:", error);
    }
  };
  
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Restoring from backup will overwrite all your current data. Are you sure?")) {
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("Invalid file");
            const data = JSON.parse(text);
            await api.restoreBackup(user.email, data);
            alert("Data restored!");
            window.location.reload();
        } catch (error) {
            alert("Failed to restore.");
        }
    };
    reader.readAsText(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">General</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Currency</label>
                <Select 
                  value={settings.currency} 
                  onChange={(e) => updateSettings({ currency: e.target.value as Settings['currency'] })}
                >
                  {SUPPORTED_CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                </Select>
              </div>
               <div>
                  <label className="block text-sm font-medium text-gray-600">Language</label>
                  <Select 
                    value={settings.language}
                    onChange={(e) => updateSettings({ language: e.target.value })}
                  >
                      {SUPPORTED_LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                  </Select>
              </div>
            </div>
        </div>

        <div className="pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Checkpoints</h3>
            <Button variant="secondary" onClick={onOpenCheckpoints} className="w-full flex items-center justify-center gap-2">
                <History size={18} /> Manage Internal Snapshots
            </Button>
            <p className="text-xs text-gray-500 mt-2">Create internal save points to quickly revert your data.</p>
        </div>

        <div className="pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Import / Export</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <Button variant="secondary" onClick={handleBackup} className="flex items-center justify-center gap-2">
                    <Download size={18} /> Export Backup
                </Button>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2">
                    <Upload size={18} /> Import Backup
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleRestore} className="hidden" accept="application/json" />
            </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="primary" onClick={onClose} className="mt-4 w-full sm:w-auto">Done</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
