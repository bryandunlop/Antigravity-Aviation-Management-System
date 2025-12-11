import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Save, RefreshCw } from "lucide-react";
import { useTaxContext, SIFLRates } from "./contexts/TaxContext";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

export default function TaxSettings() {
    const { currentRates, updateRates } = useTaxContext();
    const [formData, setFormData] = useState<SIFLRates>(currentRates);

    const handleChange = (field: string, value: string) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof SIFLRates] as any,
                    [child]: parseFloat(value) || 0
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: field === 'effectiveDate' ? value : parseFloat(value) || 0
            }));
        }
    };

    const handleSave = () => {
        updateRates(formData);
        toast.success("SIFL Rates Updated Successfully", {
            description: "New rates will be applied to all future calculations."
        });
    };

    return (
        <div className="space-y-6">
            <Card className="glass-panel">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>SIFL Rate Configuration</CardTitle>
                            <CardDescription>Update IRS Standard Industry Fare Level rates annually.</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            Effective: {formData.effectiveDate}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="effectiveDate">Effective Date</Label>
                            <Input
                                id="effectiveDate"
                                type="date"
                                value={formData.effectiveDate}
                                onChange={(e) => handleChange('effectiveDate', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="terminalCharge">Terminal Charge ($)</Label>
                            <Input
                                id="terminalCharge"
                                type="number"
                                step="0.01"
                                value={formData.terminalCharge}
                                onChange={(e) => handleChange('terminalCharge', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>0 - 500 Miles</Label>
                            <Input
                                type="number"
                                step="0.0001"
                                value={formData.mileageRates.tier1}
                                onChange={(e) => handleChange('mileageRates.tier1', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Per Mile Rate</p>
                        </div>
                        <div className="space-y-2">
                            <Label>501 - 1,500 Miles</Label>
                            <Input
                                type="number"
                                step="0.0001"
                                value={formData.mileageRates.tier2}
                                onChange={(e) => handleChange('mileageRates.tier2', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Per Mile Rate</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Over 1,500 Miles</Label>
                            <Input
                                type="number"
                                step="0.0001"
                                value={formData.mileageRates.tier3}
                                onChange={(e) => handleChange('mileageRates.tier3', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Per Mile Rate</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                            <Save className="w-4 h-4" /> Save Configuration
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
