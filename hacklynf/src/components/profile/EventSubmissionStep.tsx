import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Users, 
  User, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2,
  Building2,
  Phone
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ProfileFormValues } from "./schema";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  mobile: string;
  verified: boolean;
  verifying: boolean;
}

export const EventSubmissionStep = () => {
  const { watch } = useFormContext<ProfileFormValues>();
  const profileData = watch();

  const [participationType, setParticipationType] = useState<"individual" | "team">("individual");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pptFile, setPptFile] = useState<File | null>(null);

  // Auto-fill individual details from profile data
  const [individualDetails, setIndividualDetails] = useState({
      college: "",
      mobile: ""
  });

  const addMember = () => {
    setTeamMembers([
      ...teamMembers, 
      { 
        id: crypto.randomUUID(), 
        name: "", 
        email: "", 
        mobile: "",
        verified: false, 
        verifying: false 
      }
    ]);
  };

  const removeMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const updateMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const verifyMember = (id: string) => {
    // Start Loading
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, verifying: true } : m));

    // Simulate API Check
    setTimeout(() => {
        setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, verifying: false, verified: true } : m));
        toast.success("Member verified successfully!");
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-up">
        
      {/* Participation Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Participation Type</h3>
        <RadioGroup 
            defaultValue="individual" 
            value={participationType} 
            onValueChange={(val: "individual" | "team") => setParticipationType(val)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
            <div>
                <RadioGroupItem value="individual" id="individual" className="peer sr-only" />
                <Label
                    htmlFor="individual"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                    <User className="mb-3 h-6 w-6 text-gray-500 peer-data-[state=checked]:text-primary" />
                    <span className="font-semibold">Individual</span>
                    <span className="text-xs text-gray-500 mt-1">Participate solo</span>
                </Label>
            </div>
            <div>
                <RadioGroupItem value="team" id="team" className="peer sr-only" />
                <Label
                    htmlFor="team"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                    <Users className="mb-3 h-6 w-6 text-gray-500 peer-data-[state=checked]:text-primary" />
                    <span className="font-semibold">Team</span>
                    <span className="text-xs text-gray-500 mt-1">Form a squad (2-4 members)</span>
                </Label>
            </div>
        </RadioGroup>
      </div>

      {/* Individual Details Section */}
      {participationType === "individual" && (
          <div className="space-y-6 border-l-2 border-primary/20 pl-6 animate-in slide-in-from-left-2">
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={profileData.fullName || ""} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500">Fetched from your profile</p>
                </div>
                <div className="space-y-2">
                    <Label>College / Organization</Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                            className="pl-9" 
                            placeholder="Institute Name" 
                            value={individualDetails.college}
                            onChange={(e) => setIndividualDetails({...individualDetails, college: e.target.value})}
                        />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profileData.email || ""} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500">Fetched from your profile</p>
                </div>
                <div className="space-y-2">
                    <Label>Mobile</Label>
                    <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input 
                                className="pl-9" 
                                placeholder="9876543210" 
                                value={individualDetails.mobile}
                                onChange={(e) => setIndividualDetails({...individualDetails, mobile: e.target.value})}
                            />
                    </div>
                </div>
            </div>
             <div>
                 <Button 
                    type="button" 
                    className="w-full sm:w-auto"
                    variant="outline"
                 >
                    Verify Details <CheckCircle2 className="w-4 h-4 ml-2" />
                 </Button>
             </div>
          </div>
      )}

      {/* Team Details Section (Only if Team selected) */}
      {participationType === "team" && (
          <div className="space-y-6 border-l-2 border-primary/20 pl-6 animate-in slide-in-from-left-2">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Team Name</Label>
                    <Input placeholder="e.g. The Hackers" />
                </div>
                <div className="space-y-2">
                    <Label>College / Organization</Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input className="pl-9" placeholder="Institute Name" />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base">Team Members</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMember} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Member
                    </Button>
                </div>

                {teamMembers.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm">
                        No members added yet. Add your teammates!
                    </div>
                )}

                <div className="space-y-4">
                    {teamMembers.map((member, index) => (
                        <Card key={member.id} className="relative overflow-hidden group">
                            <CardContent className="p-4 grid md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-3 space-y-2">
                                    <Label className="text-xs text-gray-500">Name</Label>
                                    <Input 
                                        value={member.name} 
                                        onChange={(e) => updateMember(member.id, "name", e.target.value)} 
                                        placeholder="Full Name" 
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <Label className="text-xs text-gray-500">Email</Label>
                                    <Input 
                                        value={member.email} 
                                        onChange={(e) => updateMember(member.id, "email", e.target.value)} 
                                        placeholder="email@example.com" 
                                        type="email"
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <Label className="text-xs text-gray-500">Mobile</Label>
                                    <div className="relative">
                                         <Phone className="absolute left-3 top-2.5 h-3 w-3 text-gray-400" />
                                         <Input 
                                            value={member.mobile} 
                                            onChange={(e) => updateMember(member.id, "mobile", e.target.value)} 
                                            placeholder="9876543210" 
                                            className="pl-8"
                                         />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <Button 
                                        type="button" 
                                        onClick={() => verifyMember(member.id)}
                                        disabled={member.verified || member.verifying || !member.email || !member.mobile}
                                        className={`w-full ${member.verified ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
                                        variant={member.verified ? "default" : "secondary"}
                                    >
                                        {member.verifying ? (
                                            <Loader2 className="w-4 h-4 animate-spin" /> 
                                        ) : member.verified ? (
                                            <>Verified <CheckCircle2 className="w-4 h-4 ml-1" /></>
                                        ) : (
                                            "Verify"
                                        )}
                                    </Button>
                                </div>
                                <div className="md:col-span-1 flex justify-end">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-gray-400 hover:text-red-500"
                                        onClick={() => removeMember(member.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
          </div>
      )}

      {/* Project Submission */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
         <h3 className="text-lg font-semibold text-gray-900">Project Submission</h3>
         <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
            <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.ppt,.pptx"
                onChange={(e) => setPptFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    {pptFile ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>
                {pptFile ? (
                    <div>
                        <p className="font-medium text-gray-900">{pptFile.name}</p>
                        <p className="text-sm text-gray-500">{(pptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                ) : (
                    <div>
                        <p className="font-medium text-gray-900">Upload Presentation (PPT/PDF)</p>
                        <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
                    </div>
                )}
            </div>
         </div>
      </div>

    </div>
  );
};
