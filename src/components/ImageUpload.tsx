"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, Loader2, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  siteId: string;
  zoneId?: string;
  onUploadComplete?: (result: any) => void;
}

export default function ImageUpload({ siteId, zoneId, onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to S3
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('siteId', siteId);
      if (zoneId) formData.append('zoneId', zoneId);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      toast.success('Image uploaded successfully');
      setUploading(false);

      // Trigger analysis
      setAnalyzing(true);
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: uploadData.imageId,
          s3Key: uploadData.imageUrl.split('.com/')[1],
          siteId,
          zoneId,
        }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeData.success) {
        throw new Error(analyzeData.error || 'Analysis failed');
      }

      setResult(analyzeData);
      setAnalyzing(false);

      // Show results
      const summary = analyzeData.summary;
      if (summary.violations > 0) {
        toast.error(`⚠️ ${summary.violations} PPE violation(s) detected!`, {
          description: `Safety Score: ${summary.safetyScore}%`,
          duration: 8000,
        });
      } else {
        toast.success(`✅ All clear! Safety Score: ${summary.safetyScore}%`, {
          description: `${summary.personsDetected} person(s) detected with proper PPE`,
          duration: 5000,
        });
      }

      // Trigger callback to refresh dashboard data
      if (onUploadComplete) {
        onUploadComplete(analyzeData);
      }

      // Auto-refresh after 2 seconds to show updated stats
      setTimeout(() => {
        if (onUploadComplete) {
          onUploadComplete({ refresh: true });
        }
      }, 2000);

    } catch (error: any) {
      console.error('Upload/Analysis error:', error);
      toast.error(error.message || 'Failed to process image');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-zinc-900/20 border-zinc-800 border-none shadow-3xl overflow-hidden">
      <CardContent className="p-10">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight uppercase tracking-[0.1em]">
                Edge Vision Upload
              </h3>
              <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold">
                AI-Powered Safety & Progress Analysis
              </p>
            </div>
            {preview && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="h-10 w-10 rounded-full text-zinc-600 hover:text-white"
              >
                <X size={20} />
              </Button>
            )}
          </div>

          {/* Upload Area */}
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-800 rounded-3xl p-20 text-center cursor-pointer hover:border-blue-600/50 hover:bg-blue-600/5 transition-all group"
                >
                  <div className="flex flex-col items-center gap-6">
                    <div className="bg-blue-600/10 p-8 rounded-3xl group-hover:scale-110 transition-transform">
                      <Camera size={40} className="text-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-bold text-sm uppercase tracking-widest">
                        Upload Construction Site Photo
                      </p>
                      <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
                        JPG, PNG up to 10MB • Instant AI Analysis
                      </p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 text-[10px] font-bold uppercase tracking-widest">
                      <Upload size={16} className="mr-2" />
                      Select Image
                    </Button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                {/* Image Preview */}
                <div className="relative rounded-3xl overflow-hidden bg-black">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                  
                  {/* Processing Overlay */}
                  {(uploading || analyzing) && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center space-y-6">
                        <Loader2 size={48} className="text-blue-500 animate-spin mx-auto" />
                        <div className="space-y-2">
                          <p className="text-white font-bold text-sm uppercase tracking-widest">
                            {uploading ? 'Uploading to AWS S3...' : 'Analyzing with Rekognition...'}
                          </p>
                          <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
                            {uploading ? 'Secure cloud storage' : 'PPE detection in progress'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis Results */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-zinc-950/50 border-zinc-800 p-6">
                        <div className="space-y-2">
                          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">
                            Safety Score
                          </p>
                          <p className={`text-3xl font-bold ${
                            result.summary.safetyScore >= 90 ? 'text-green-500' :
                            result.summary.safetyScore >= 70 ? 'text-amber-500' : 'text-red-500'
                          }`}>
                            {result.summary.safetyScore}%
                          </p>
                        </div>
                      </Card>

                      <Card className="bg-zinc-950/50 border-zinc-800 p-6">
                        <div className="space-y-2">
                          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">
                            Persons
                          </p>
                          <p className="text-3xl font-bold text-white">
                            {result.summary.personsDetected}
                          </p>
                        </div>
                      </Card>

                      <Card className="bg-zinc-950/50 border-zinc-800 p-6">
                        <div className="space-y-2">
                          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">
                            Violations
                          </p>
                          <p className={`text-3xl font-bold ${
                            result.summary.violations > 0 ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {result.summary.violations}
                          </p>
                        </div>
                      </Card>

                      <Card className="bg-zinc-950/50 border-zinc-800 p-6">
                        <div className="space-y-2">
                          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">
                            Items Detected
                          </p>
                          <p className="text-3xl font-bold text-blue-500">
                            {result.summary.constructionItemsDetected}
                          </p>
                        </div>
                      </Card>
                    </div>

                    {/* Detailed Results */}
                    {result.analysis.ppe_violations.length > 0 && (
                      <Card className="bg-red-500/10 border-red-500/30 p-6">
                        <div className="flex items-start gap-4">
                          <AlertTriangle size={24} className="text-red-500 shrink-0 mt-1" />
                          <div className="space-y-3">
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest">
                              PPE Violations Detected
                            </h4>
                            {result.analysis.ppe_violations.map((violation: any, i: number) => (
                              <div key={i} className="text-[11px] text-zinc-300">
                                Person {violation.personId}: Missing {violation.missingEquipment.join(', ')}
                                <span className="text-zinc-600 ml-2">
                                  ({Math.round(violation.confidence)}% confidence)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    )}

                    {result.summary.violations === 0 && result.summary.personsDetected > 0 && (
                      <Card className="bg-green-500/10 border-green-500/30 p-6">
                        <div className="flex items-center gap-4">
                          <CheckCircle2 size={24} className="text-green-500" />
                          <p className="text-white font-bold text-sm uppercase tracking-widest">
                            All Workers Compliant - No Violations Detected
                          </p>
                        </div>
                      </Card>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
