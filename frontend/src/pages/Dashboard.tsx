import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { message } from 'antd';
import { FileUploader } from '@/components/FileUploader';
import type { FileUploadResult } from '@/components/FileUploader';
import { motion } from 'framer-motion';
import { getMockSystemStatus, type SystemStatusData } from '@/utils/systemService';

const Dashboard: React.FC = () => {
  const [lastUpload, setLastUpload] = useState<FileUploadResult | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatusData>({
    backend: 'Checking',
    storage: 'Checking',
    gateway: 'Checking'
  });

  const fetchStatus = async () => {
    const status = await getMockSystemStatus();
    setSystemStatus(status);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = (result: FileUploadResult) => {
    setLastUpload(result);
    message.success(`File ${result.fileName} uploaded!`);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight"
        >
          Omnigence <span className="text-blue-600">AI</span>
        </motion.h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <FileUploader
            onSuccess={handleUploadSuccess}
            uploadText="Quick Upload"
            uploadHint="Upload any file to the server"
          />
          {lastUpload && (
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm animate-in fade-in slide-in-from-bottom-2">
              <p className="font-bold text-slate-700">Last Upload: {lastUpload.fileName}</p>
              <p className="text-slate-500 text-xs">ID: {lastUpload.fileId}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} />
              System Status
            </h2>
            <button
              onClick={fetchStatus}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-blue-600"
            >
              <RefreshCw size={16} className={systemStatus.backend === 'Checking' ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-4">
            <StatusItem title="Backend Server" status={systemStatus.backend} />
            <StatusItem title="Storage Service" status={systemStatus.storage} />
            <StatusItem title="API Gateway" status={systemStatus.gateway} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusItem = ({ title, status }: { title: string; status: string }) => {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Error': return 'text-rose-600';
      case 'Checking': return 'text-slate-400';
      default: return 'text-emerald-600';
    }
  };

  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
      <span className="font-bold text-slate-900 text-sm">{title}</span>
      <span className={`text-xs font-bold uppercase ${getStatusColor(status)}`}>{status}</span>
    </div>
  );
};

export default Dashboard;
