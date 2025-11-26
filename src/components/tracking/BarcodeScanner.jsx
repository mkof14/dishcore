import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Barcode, X, Loader2, Plus, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function BarcodeScanner({ onResult, onClose }) {
  const [scanning, setScanning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [manualInput, setManualInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [productData, setProductData] = useState({
    product_name: "",
    brand: "",
    serving_size: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    sugar: "",
    sodium: ""
  });
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const queryClient = useQueryClient();

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setScanning(true);
    } catch (error) {
      toast.error('Failed to access camera');
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
  };

  const searchBarcodeMutation = useMutation({
    mutationFn: async (barcodeNumber) => {
      const products = await base44.entities.BarcodeProduct.filter({ barcode: barcodeNumber });
      return products[0] || null;
    },
    onSuccess: (product, barcodeNumber) => {
      if (product) {
        toast.success('Product found in database!');
        onResult({
          product_name: product.product_name,
          description: `${product.brand || ''} - ${product.serving_size || ''}`,
          calories: product.calories,
          protein: product.protein || 0,
          carbs: product.carbs || 0,
          fat: product.fat || 0,
          fiber: product.fiber || 0,
          sugar: product.sugar || 0,
          sodium: product.sodium || 0,
          serving_size: product.serving_size,
          image_url: product.image_url,
          barcode: barcodeNumber
        });
        stopScanning();
        onClose();
      } else {
        toast.error('Product not found. Add it manually?');
        setManualBarcode(barcodeNumber);
        setManualInput(true);
        stopScanning();
      }
    }
  });

  const addProductMutation = useMutation({
    mutationFn: (data) => base44.entities.BarcodeProduct.create(data),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries(['barcodeProducts']);
      toast.success('Product added to database!');
      onResult({
        product_name: newProduct.product_name,
        description: `${newProduct.brand || ''} - ${newProduct.serving_size || ''}`,
        calories: newProduct.calories,
        protein: newProduct.protein || 0,
        carbs: newProduct.carbs || 0,
        fat: newProduct.fat || 0,
        fiber: newProduct.fiber || 0,
        sugar: newProduct.sugar || 0,
        sodium: newProduct.sodium || 0,
        serving_size: newProduct.serving_size,
        barcode: newProduct.barcode
      });
      setManualInput(false);
      onClose();
    }
  });

  const captureBarcode = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    setAnalyzing(true);
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      const file = new File([blob], `barcode-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract the barcode number from this image. Look for UPC, EAN, or any barcode.
        Return ONLY the numeric barcode string.
        If no barcode is visible, set barcode_found to false.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            barcode_found: { type: "boolean" },
            barcode_number: { type: "string" }
          }
        }
      });

      if (!analysis.barcode_found || !analysis.barcode_number) {
        toast.error('No barcode detected. Try again or enter manually.');
        setAnalyzing(false);
        return;
      }

      searchBarcodeMutation.mutate(analysis.barcode_number);
    } catch (error) {
      console.error(error);
      toast.error('Failed to scan barcode');
    }
    setAnalyzing(false);
  };

  const handleManualSearch = () => {
    if (!manualBarcode.trim()) {
      toast.error('Enter a barcode number');
      return;
    }
    searchBarcodeMutation.mutate(manualBarcode.trim());
  };

  const handleManualSubmit = () => {
    if (!productData.product_name || !productData.calories) {
      toast.error('Product name and calories are required');
      return;
    }

    addProductMutation.mutate({
      barcode: manualBarcode,
      product_name: productData.product_name,
      brand: productData.brand,
      serving_size: productData.serving_size,
      calories: parseFloat(productData.calories),
      protein: parseFloat(productData.protein) || 0,
      carbs: parseFloat(productData.carbs) || 0,
      fat: parseFloat(productData.fat) || 0,
      fiber: parseFloat(productData.fiber) || 0,
      sugar: parseFloat(productData.sugar) || 0,
      sodium: parseFloat(productData.sodium) || 0
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gradient-card border-0 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Barcode className="w-6 h-6" />
              Barcode Scanner
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!scanning && !manualInput ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Barcode className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--text-muted)' }} />
                <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Scan Product Barcode
                </h4>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                  Position the barcode within the camera frame
                </p>
                <Button onClick={startScanning} className="gradient-accent text-white border-0 w-full mb-3">
                  <Barcode className="w-4 h-4 mr-2" />
                  Start Camera Scan
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                    Or
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label style={{ color: 'var(--text-secondary)' }}>Enter Barcode Manually</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter barcode number..."
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                  <Button onClick={handleManualSearch} disabled={searchBarcodeMutation.isPending}>
                    {searchBarcodeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : scanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-40 border-4 border-green-500 rounded-xl"></div>
              </div>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="bg-white/90 hover:bg-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={captureBarcode}
                  disabled={analyzing}
                  className="gradient-accent text-white border-0"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Barcode className="w-4 h-4 mr-2" />
                      Scan Barcode
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Product Not Found
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Help build our database by adding this product's information
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label style={{ color: 'var(--text-secondary)' }}>Barcode</Label>
                  <Input
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="col-span-2">
                  <Label style={{ color: 'var(--text-secondary)' }}>Product Name *</Label>
                  <Input
                    value={productData.product_name}
                    onChange={(e) => setProductData({...productData, product_name: e.target.value})}
                    placeholder="e.g., Greek Yogurt"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label style={{ color: 'var(--text-secondary)' }}>Brand</Label>
                  <Input
                    value={productData.brand}
                    onChange={(e) => setProductData({...productData, brand: e.target.value})}
                    placeholder="e.g., Chobani"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label style={{ color: 'var(--text-secondary)' }}>Serving Size</Label>
                  <Input
                    value={productData.serving_size}
                    onChange={(e) => setProductData({...productData, serving_size: e.target.value})}
                    placeholder="e.g., 150g"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label style={{ color: 'var(--text-secondary)' }}>Calories *</Label>
                  <Input
                    type="number"
                    value={productData.calories}
                    onChange={(e) => setProductData({...productData, calories: e.target.value})}
                    placeholder="150"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label style={{ color: 'var(--text-secondary)' }}>Protein (g)</Label>
                  <Input
                    type="number"
                    value={productData.protein}
                    onChange={(e) => setProductData({...productData, protein: e.target.value})}
                    placeholder="15"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label style={{ color: 'var(--text-secondary)' }}>Carbs (g)</Label>
                  <Input
                    type="number"
                    value={productData.carbs}
                    onChange={(e) => setProductData({...productData, carbs: e.target.value})}
                    placeholder="12"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label style={{ color: 'var(--text-secondary)' }}>Fat (g)</Label>
                  <Input
                    type="number"
                    value={productData.fat}
                    onChange={(e) => setProductData({...productData, fat: e.target.value})}
                    placeholder="3"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setManualInput(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleManualSubmit}
                  disabled={addProductMutation.isPending}
                  className="flex-1 gradient-accent text-white border-0"
                >
                  {addProductMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}