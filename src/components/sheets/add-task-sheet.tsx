import MainButton from '@/src/components/core/MainButton';
import AppText from '@/src/components/core/AppText';
import BaseSheet from './base-sheet';
import BaseSheetHeader from './base-sheet-header';
import { COLORS } from '@/src/constants/theme';
import { useCreateCustomTask } from '@/src/hooks/custom-tasks';
import { usePlants } from '@/src/hooks/plants';
import { CareType } from '@/src/api/care-logs';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

type Props = {
    sheetRef: React.RefObject<TrueSheet | null>;
    selectedDate: Dayjs;
    handleDismiss: () => void;
};

const CARE_TYPES: { type: CareType; label: string; color: string }[] = [
    { type: 'WATER', label: 'Water', color: '#4A9EE8' },
    { type: 'FERTILIZE', label: 'Fertilise', color: '#78B652' },
    { type: 'REPOT', label: 'Repot', color: '#A0714F' },
];

export default function AddTaskSheet({ sheetRef, selectedDate, handleDismiss }: Props) {
    const [title, setTitle] = useState('');
    const [selectedType, setSelectedType] = useState<CareType | null>(null);
    const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
    const { plants } = usePlants();
    const createCustomTask = useCreateCustomTask();

    const reset = () => {
        setTitle('');
        setSelectedType(null);
        setSelectedPlantId(null);
    };

    const handleAdd = () => {
        if (!title.trim() || !selectedType) return;
        createCustomTask.mutate(
            {
                title: title.trim(),
                type: selectedType,
                dueDate: selectedDate.format('YYYY-MM-DD'),
                ...(selectedPlantId ? { plantId: selectedPlantId } : {}),
            },
            {
                onSuccess: () => {
                    reset();
                    sheetRef.current?.dismiss();
                },
            },
        );
    };

    const isValid = title.trim().length > 0 && selectedType !== null;

    return (
        <BaseSheet ref={sheetRef} detents={['auto']} onDidDismiss={reset}>
            <BaseSheetHeader
                title={`Add Task · ${selectedDate.format('MMM D')}`}
                handleClose={handleDismiss}
            />
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            >
                {/* Title */}
                <AppText size="xs" color="gray" style={{ marginBottom: 6 }}>
                    Task title
                </AppText>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g. Check for pests"
                    placeholderTextColor={COLORS.textSecondary}
                    style={{
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        borderRadius: 10,
                        padding: 12,
                        fontSize: 15,
                        marginBottom: 20,
                        color: COLORS.textPrimary,
                    }}
                    autoCapitalize="sentences"
                    returnKeyType="done"
                />

                {/* Care type */}
                <AppText size="xs" color="gray" style={{ marginBottom: 8 }}>
                    Care type
                </AppText>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                    {CARE_TYPES.map(({ type, label, color }) => {
                        const isActive = selectedType === type;
                        return (
                            <Pressable
                                key={type}
                                onPress={() => setSelectedType(type)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    backgroundColor: isActive
                                        ? `${color}20`
                                        : COLORS.backgroundSecondary,
                                    borderWidth: 1.5,
                                    borderColor: isActive ? color : 'transparent',
                                }}
                            >
                                <AppText
                                    size="xs"
                                    font="semiBold"
                                    style={{ color: isActive ? color : COLORS.textSecondary }}
                                >
                                    {label}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Plant (optional) */}
                {plants.length > 0 && (
                    <>
                        <AppText size="xs" color="gray" style={{ marginBottom: 8 }}>
                            Plant (optional)
                        </AppText>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8, marginBottom: 24 }}
                        >
                            <Pressable
                                onPress={() => setSelectedPlantId(null)}
                                style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    backgroundColor:
                                        selectedPlantId === null
                                            ? COLORS.primaryDark
                                            : COLORS.backgroundSecondary,
                                }}
                            >
                                <AppText
                                    size="xs"
                                    font="semiBold"
                                    style={{
                                        color:
                                            selectedPlantId === null ? '#fff' : COLORS.textSecondary,
                                    }}
                                >
                                    No plant
                                </AppText>
                            </Pressable>
                            {plants.map((plant) => (
                                <Pressable
                                    key={plant.id}
                                    onPress={() => setSelectedPlantId(plant.id)}
                                    style={{
                                        paddingHorizontal: 14,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        backgroundColor:
                                            selectedPlantId === plant.id
                                                ? COLORS.primaryDark
                                                : COLORS.backgroundSecondary,
                                    }}
                                >
                                    <AppText
                                        size="xs"
                                        font="semiBold"
                                        style={{
                                            color:
                                                selectedPlantId === plant.id
                                                    ? '#fff'
                                                    : COLORS.textSecondary,
                                        }}
                                    >
                                        {plant.name}
                                    </AppText>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </>
                )}

                <MainButton
                    text="Add Task"
                    onPress={handleAdd}
                    isLoading={createCustomTask.isPending}
                    isDisabled={!isValid}
                />
            </ScrollView>
        </BaseSheet>
    );
}
