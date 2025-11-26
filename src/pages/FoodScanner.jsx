import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, X, Loader2, CheckCircle2, Maximize2, ArrowLeft, Sparkles, Barcode } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import BarcodeScanner from "../components/tracking/BarcodeScanner";
import MicronutrientDisplay from "../components/dishes/MicronutrientDisplay";
import AIFoodAnalyzer from "../components/dishes/AIFoodAnalyzer";

export default function FoodScanner() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false);
  const [mealType, setMealType] = useState("lunch");
  const videoRef = useRef(null);
  const queryClient = useQueryClient();

  const handleFileUpload = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setUploadedImage(e.target.result);
    reader.readAsDataURL(file);

    setAnalyzing(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this food image and provide comprehensive nutritional information. 

IMPORTANT: Provide detailed and accurate nutritional data including:
1. Food name and description
2. Estimated portion size
3. Complete macronutrients (calories, protein, carbs, fat, fiber, sugar, sodium)
4. Comprehensive micronutrients (vitamins A, C, D, E, K, B6, B12, folate, calcium, iron, magnesium, potassium, zinc, omega-3)
5. Food category for classification
6. Health score (0-100) based on nutritional density
7. Brief nutritional summary

Base estimates on standard USDA nutritional database values for accuracy.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            dish_name: { type: "string" },
            description: { type: "string" },
            estimated_portion: { type: "string" },
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fat: { type: "number" },
            fiber: { type: "number" },
            sugar: { type: "number" },
            sodium: { type: "number" },
            micronutrients: {
              type: "object",
              properties: {
                vitamin_a: { type: "number" },
                vitamin_c: { type: "number" },
                vitamin_d: { type: "number" },
                vitamin_e: { type: "number" },
                vitamin_k: { type: "number" },
                vitamin_b6: { type: "number" },
                vitamin_b12: { type: "number" },
                folate: { type: "number" },
                calcium: { type: "number" },
                iron: { type: "number" },
                magnesium: { type: "number" },
                potassium: { type: "number" },
                zinc: { type: "number" },
                omega3: { type: "number" }
              }
            },
            food_category: { type: "string" },
            health_score: { type: "number" },
            ai_summary: { type: "string" }
          },
          required: ["dish_name", "calories", "protein", "carbs", "fat"]
        }
      });

      setResult({ ...analysisResult, image_url: file_url });
      setAnalyzing(false);
      toast.success("Food analyzed successfully!");
    } catch (error) {
      setAnalyzing(false);
      toast.error("Failed to analyze image");
      console.error(error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      toast.error("Camera access denied");
      console.error(error);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      handleFileUpload(file);
      
      const stream = video.srcObject;
      stream?.getTracks().forEach(track => track.stop());
      setShowCamera(false);
    }, 'image/jpeg');
  };

  const logMealMutation = useMutation({
    mutationFn: async (mealData) => {
      return await base44.entities.MealLog.create({
        date: format(new Date(), 'yyyy-MM-dd'),
        meal_type: mealType,
        dish_name: mealData.dish_name || mealData.product_name,
        description: mealData.description || "",
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        image_url: mealData.image_url || null,
        notes: mealData.barcode ? `Barcode: ${mealData.barcode}` : `AI Scanned - ${mealData.estimated_portion || 'Standard serving'}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mealLogs']);
      toast.success('Meal logged successfully!');
      setResult(null);
      setUploadedImage(null);
    },
  });

  const handleBarcodeResult = (data) => {
    setResult({
      dish_name: data.product_name || "Barcode Scanned Item",
      description: data.description || "",
      estimated_portion: data.serving_size || "1 serving",
      calories: data.calories || 0,
      protein: data.protein || 0,
      carbs: data.carbs || 0,
      fat: data.fat || 0,
      fiber: data.fiber || 0,
      sugar: data.sugar || 0,
      sodium: data.sodium || 0,
      micronutrients: data.micronutrients || {},
      food_category: data.category || "Packaged Food",
      health_score: data.health_score || 50,
      ai_summary: `Product scanned via barcode${data.barcode ? `: ${data.barcode}` : ''}`,
      image_url: data.image_url || null,
      barcode: data.barcode
    });
    setUploadedImage(data.image_url || null);
    setShowBarcodeScanner(false);
  };

  const handleAIAnalyzedFood = (foodData) => {
    setResult(foodData);
    setUploadedImage(null);
  };

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="w-12 h-12 rounded-2xl btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                AI Food Scanner
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                Scan barcodes or analyze food images
              </p>
            </div>
          </div>
        </div>

        {!uploadedImage && !showCamera && !showBarcodeScanner && !showAIAnalyzer && !result && (
          <div className="grid md:grid-cols-4 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                className="gradient-card border-0 p-6 rounded-3xl cursor-pointer text-center hover:shadow-2xl transition-all"
                onClick={() => setShowBarcodeScanner(true)}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Barcode className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Scan Barcode</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Quick product lookup
                </p>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                className="gradient-card border-0 p-6 rounded-3xl cursor-pointer text-center hover:shadow-2xl transition-all"
                onClick={() => document.getElementById('file-upload').click()}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Upload Photo</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Analyze any food
                </p>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                className="gradient-card border-0 p-6 rounded-3xl cursor-pointer text-center hover:shadow-2xl transition-all"
                onClick={startCamera}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Take Photo</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Instant capture
                </p>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                className="gradient-card border-0 p-6 rounded-3xl cursor-pointer text-center hover:shadow-2xl transition-all"
                onClick={() => setShowAIAnalyzer(true)}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>AI Analysis</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Enter food name
                </p>
              </Card>
            </motion.div>
          </div>
        )}

        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />

        {/* Camera View */}
        {showCamera && (
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl" />
              <div className="flex gap-3 mt-4">
                <Button onClick={capturePhoto} className="flex-1 gradient-accent text-white border-0">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
                <Button onClick={() => {
                  const stream = videoRef.current?.srcObject;
                  stream?.getTracks().forEach(track => track.stop());
                  setShowCamera(false);
                }} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Analysis Results */}
        <AnimatePresence>
          {(uploadedImage || result) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="gradient-card border-0 p-6 rounded-3xl">
                {uploadedImage && (
                  <div className="relative mb-4">
                    <img src={uploadedImage} alt="Food" className="w-full h-64 object-cover rounded-2xl" />
                    <Button
                      onClick={() => {
                        setUploadedImage(null);
                        setResult(null);
                      }}
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {analyzing ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--accent-from)' }} />
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Analyzing food with AI...
                    </p>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                      Extracting nutritional data and micronutrients
                    </p>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {result.dish_name}
                        </h3>
                        {result.description && (
                          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                            {result.description}
                          </p>
                        )}
                        {result.estimated_portion && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Portion: {result.estimated_portion}
                          </p>
                        )}
                      </div>
                      {result.health_score !== undefined && (
                        <div className="text-center">
                          <div className="text-2xl font-bold gradient-text">{result.health_score}</div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Health Score</p>
                        </div>
                      )}
                    </div>

                    {result.ai_summary && (
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <strong>💡 AI Summary:</strong> {result.ai_summary}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Calories</p>
                        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                          {Math.round(result.calories)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Protein</p>
                        <p className="text-xl font-bold text-blue-400">{Math.round(result.protein)}g</p>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Carbs</p>
                        <p className="text-xl font-bold text-orange-400">{Math.round(result.carbs)}g</p>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Fat</p>
                        <p className="text-xl font-bold text-purple-400">{Math.round(result.fat)}g</p>
                      </div>
                    </div>

                    {result.micronutrients && Object.keys(result.micronutrients).length > 0 && (
                      <MicronutrientDisplay micronutrients={result.micronutrients} />
                    )}

                    <div className="flex gap-3">
                      <Select value={mealType} onValueChange={setMealType}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Meal Type"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => logMealMutation.mutate(result)}
                        disabled={logMealMutation.isPending}
                        className="flex-1 gradient-accent text-white border-0"
                      >
                        {logMealMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Log Meal
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How It Works */}
        {!uploadedImage && !showCamera && !showBarcodeScanner && !showAIAnalyzer && !result && (
          <Card className="gradient-card border-0 p-6 rounded-3xl">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              🔬 How It Works
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Barcode Scanning
                </h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Scan product barcodes for instant nutritional data. If not found, add it manually to help build our community database.
                </p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface-alt)' }}>
                <div className="text-2xl mb-2">🧠</div>
                <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  AI Food Recognition
                </h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Advanced AI identifies food from photos and provides complete nutritional analysis with micronutrients.
                </p>
              </div>
            </div>
          </Card>
        )}

        {showBarcodeScanner && (
          <BarcodeScanner
            onResult={handleBarcodeResult}
            onClose={() => setShowBarcodeScanner(false)}
          />
        )}

        <AIFoodAnalyzer
          open={showAIAnalyzer}
          onClose={() => setShowAIAnalyzer(false)}
          onFoodAnalyzed={handleAIAnalyzedFood}
        />
      </div>
    </div>
  );
}