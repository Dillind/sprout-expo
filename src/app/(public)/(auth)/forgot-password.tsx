import AppText from '@/src/components/core/AppText';
import supabase from '@/src/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { z } from 'zod';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) return (
    <View className="flex-1 px-6 pt-16 items-center justify-center">
      <AppText className="text-2xl font-bold mb-4">Email sent</AppText>
      <AppText className="text-base text-gray-500 text-center">Check your inbox for a password reset link.</AppText>
      <Pressable onPress={() => router.back()} className="mt-8">
        <AppText className="text-green-700 font-medium">Back to sign in</AppText>
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 px-6 pt-16">
      <Pressable onPress={() => router.back()} className="mb-8">
        <AppText className="text-base text-gray-500">← Back</AppText>
      </Pressable>
      <AppText className="text-2xl font-bold mb-2">Reset password</AppText>
      <AppText className="text-base text-gray-500 mb-8">Enter your email and we&apos;ll send you a reset link.</AppText>
      <View className="gap-4">
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <View>
            <TextInput placeholder="Email" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" className="h-[52px] border border-gray-200 rounded-xl px-4 text-base" />
            {errors.email && <AppText className="text-red-500 text-sm mt-1">{errors.email.message}</AppText>}
          </View>
        )} />
        {error && <AppText className="text-red-500 text-sm text-center">{error}</AppText>}
        <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="h-[52px] bg-green-700 rounded-xl items-center justify-center">
          {isSubmitting ? <ActivityIndicator color="white" /> : <AppText className="text-white font-semibold text-base">Send reset link</AppText>}
        </Pressable>
      </View>
    </View>
  );
}
