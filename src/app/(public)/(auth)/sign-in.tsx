import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AppText from '@/components/core/AppText';
import { supabase } from '@/src/lib/supabase';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function SignInScreen() {
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) setError(error.message);
  }

  return (
    <View className="flex-1 px-6 pt-16">
      <Pressable onPress={() => router.back()} className="mb-8">
        <AppText className="text-base text-gray-500">← Back</AppText>
      </Pressable>
      <AppText className="text-2xl font-bold mb-8">Sign in</AppText>
      <View className="gap-4">
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <View>
            <TextInput placeholder="Email" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" className="h-[52px] border border-gray-200 rounded-xl px-4 text-base" />
            {errors.email && <AppText className="text-red-500 text-sm mt-1">{errors.email.message}</AppText>}
          </View>
        )} />
        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <View>
            <TextInput placeholder="Password" value={value} onChangeText={onChange} secureTextEntry className="h-[52px] border border-gray-200 rounded-xl px-4 text-base" />
            {errors.password && <AppText className="text-red-500 text-sm mt-1">{errors.password.message}</AppText>}
          </View>
        )} />
        {error && <AppText className="text-red-500 text-sm text-center">{error}</AppText>}
        <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="h-[52px] bg-green-700 rounded-xl items-center justify-center">
          {isSubmitting ? <ActivityIndicator color="white" /> : <AppText className="text-white font-semibold text-base">Sign in</AppText>}
        </Pressable>
        <Pressable onPress={() => router.push('/(public)/(auth)/forgot-password')} className="items-center">
          <AppText className="text-sm text-gray-500">Forgot password?</AppText>
        </Pressable>
        <Pressable onPress={() => router.push('/(public)/(auth)/sign-up')} className="items-center">
          <AppText className="text-sm text-gray-500">Don't have an account? <AppText className="text-green-700 font-medium">Sign up</AppText></AppText>
        </Pressable>
      </View>
    </View>
  );
}
