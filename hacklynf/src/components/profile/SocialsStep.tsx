
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Github, Linkedin, Twitter, Globe, Mail } from "lucide-react";
import { ProfileFormValues } from "./schema";

export const SocialsStep = () => {
  const { control } = useFormContext<ProfileFormValues>();

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium">Connect your online presence</h3>
        <p className="text-sm text-muted-foreground">This helps others find you and see your work.</p>
      </div>

      <div className="grid gap-6">
        <FormField
          control={control}
          name="github"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub
              </FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-600" /> LinkedIn
              </FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/in/username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="twitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-sky-500" /> Twitter (Optional)
              </FormLabel>
              <FormControl>
                <Input placeholder="https://twitter.com/username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> Personal Website (Optional)
              </FormLabel>
              <FormControl>
                <Input placeholder="https://yourwebsite.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
