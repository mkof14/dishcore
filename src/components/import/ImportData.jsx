import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileText, AlertCircle, CheckCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function ImportData() {
  const [showDialog, setShowDialog] = useState(false);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const supportedFormats = [
    { name: 'MyFitnessPal CSV', desc: 'Export from MyFitnessPal app' },
    { name: 'Cronometer JSON', desc: 'Export from Cronometer' },
    { name: 'Lose It! CSV', desc: 'Export from Lose It! app' },
    { name: 'DishCore JSON', desc: 'Previous DishCore export' },
    { name: 'Generic CSV', desc: 'Custom CSV format' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['text/csv', 'application/json', 'text/plain'];
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        toast.error('Please upload a CSV or JSON file');
      }
    }
  };

  const importMutation = useMutation({
    mutationFn: async (fileData) => {
      setImporting(true);
      setProgress(10);

      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: fileData });
      setProgress(30);

      // Detect format and extract data
      const schema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            date: { type: "string" },
            meal_type: { type: "string" },
            dish_name: { type: "string" },
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fat: { type: "number" }
          }
        }
      };

      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: schema
      });

      setProgress(60);

      if (extractResult.status === 'error') {
        throw new Error(extractResult.details || 'Failed to parse file');
      }

      // Import to database
      const meals = extractResult.output || [];
      let imported = 0;

      for (const meal of meals) {
        try {
          await base44.entities.MealLog.create({
            date: meal.date || new Date().toISOString().split('T')[0],
            meal_type: meal.meal_type || 'snack',
            dish_name: meal.dish_name || 'Imported Food',
            calories: meal.calories || 0,
            protein: meal.protein || 0,
            carbs: meal.carbs || 0,
            fat: meal.fat || 0,
            is_imported: true
          });
          imported++;
          setProgress(60 + (imported / meals.length * 40));
        } catch (error) {
          console.error('Failed to import meal:', error);
        }
      }

      return { imported, total: meals.length };
    },
    onSuccess: (result) => {
      setProgress(100);
      toast.success(`Successfully imported ${result.imported} meals!`);
      queryClient.invalidateQueries(['mealLogs']);
      setTimeout(() => {
        setShowDialog(false);
        setFile(null);
        setImporting(false);
        setProgress(0);
      }, 1500);
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
      setImporting(false);
      setProgress(0);
    }
  });

  const handleImport = () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    importMutation.mutate(file);
  };

  return (
    <>
      <Card className="gradient-card border-0 p-6 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Import Data
          </h2>
        </div>

        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Import your meal history from other apps
        </p>

        <div className="space-y-2 mb-6">
          {supportedFormats.map((format, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong>{format.name}</strong> - {format.desc}
              </span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setShowDialog(true)}
          className="w-full gradient-accent text-white border-0"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import from File
        </Button>

        <div className="mt-4 p-3 rounded-xl flex items-start gap-2" 
          style={{ background: 'rgba(255, 165, 0, 0.1)' }}>
          <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            <strong>Note:</strong> Import is best-effort. Some data may need manual review.
          </p>
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="gradient-card border-0">
          <DialogHeader>
            <DialogTitle>Import Nutrition Data</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!importing ? (
              <>
                <div className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                  style={{ borderColor: 'var(--border-soft)' }}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {file ? file.name : 'Click to select file'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    CSV or JSON • Max 10MB
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleImport}
                    disabled={!file}
                    className="gradient-accent text-white border-0 flex-1"
                  >
                    Start Import
                  </Button>
                  <Button onClick={() => setShowDialog(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-8">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center animate-pulse">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Importing your data...
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {progress}% complete
                  </p>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}