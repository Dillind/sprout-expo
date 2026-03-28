import VisibilityIcon from '@/src/assets/icons/visibility-off-icon';
import FieldError from '@/src/lib/form/components/field-error';
import React, { useState } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import {
    BlurEvent,
    FocusEvent,
    KeyboardTypeOptions,
    Pressable,
    ReturnKeyTypeOptions,
    StyleProp,
    StyleSheet,
    TextInput,
    View,
    ViewStyle,
} from 'react-native';
import AppText from './AppText';
import IndicatedText from './IndicatedText';

type Props = {
    placeholder?: string;
    value: string;
    onChangeText?: (value: string) => void;
    keyboardType?: KeyboardTypeOptions;
    isEditable?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    containerStyle?: StyleProp<ViewStyle>;
    secureTextEntry?: boolean;
    label?: string;
    marginTop?: number;
    marginBottom?: number;
    onPress?: () => void;
    suffix?: string;
    onBlur?: ((e: BlurEvent) => void) | undefined;
    onFocus?: ((e: FocusEvent) => void) | undefined;
    rightIcon?: React.ReactNode;
    isLabelIndicated?: boolean;
    leftIcon?: React.ReactNode;
    name?: string;
    description?: string;
    height?: number;
    returnKeyType?: ReturnKeyTypeOptions;
    maxLength?: number;
};

const TextInputValidated = React.forwardRef<TextInput, Props>(
    (
        {
            name,
            placeholder,
            value,
            autoCapitalize = 'none',
            containerStyle,
            isEditable = true,
            keyboardType,
            onChangeText,
            secureTextEntry,
            label,
            marginTop,
            marginBottom,
            onPress,
            onBlur,
            onFocus,
            isLabelIndicated,
            leftIcon,
            description,
            height = 46,
            rightIcon,
            returnKeyType = 'done',
            maxLength,
        },
        ref,
    ) => {
        const [isSecured, setIsSecured] = useState<boolean | undefined>(secureTextEntry);
        const form = useFormContext();
        const { errors } = useFormState({ control: form?.control, name });

        return (
            <View style={[containerStyle, { marginBottom, marginTop }]}>
                {label &&
                    (isLabelIndicated ? (
                        <IndicatedText text={label} marginBottom={description ? 0 : 4} />
                    ) : (
                        <AppText color="black" size="base" font="bold" className="mb-4">
                            {label}
                        </AppText>
                    ))}
                {description && (
                    <AppText size="base" font="base" color="black" className="mb-4">
                        {description}
                    </AppText>
                )}
                <View
                    className="flex-row items-center border border-spaceCharcoal20 rounded-lg h-12 bg-white"
                    style={{
                        height,
                    }}
                >
                    {leftIcon && leftIcon}
                    <TextInput
                        ref={ref}
                        onBlur={onBlur}
                        onPress={onPress}
                        onFocus={onFocus}
                        secureTextEntry={isSecured}
                        editable={isEditable}
                        autoComplete="off"
                        textContentType={secureTextEntry ? 'oneTimeCode' : undefined}
                        autoCorrect={false}
                        autoCapitalize={autoCapitalize}
                        placeholder={placeholder}
                        placeholderTextColor="black"
                        keyboardType={keyboardType}
                        style={styles.textInput}
                        importantForAutofill="yes"
                        value={value}
                        onChangeText={onChangeText}
                        returnKeyType={returnKeyType}
                        maxLength={maxLength}
                    />
                    {rightIcon && rightIcon}
                    {secureTextEntry && (
                        <Pressable onPress={() => setIsSecured(!isSecured)} className="p-2">
                            {isSecured ? <VisibilityIcon /> : <VisibilityIcon opacity={0.5} />}
                        </Pressable>
                    )}
                </View>
                {name && <FieldError error={errors?.[name]?.message as string} />}
            </View>
        );
    },
);

TextInputValidated.displayName = 'TextInputValidated';

export default TextInputValidated;

const styles = StyleSheet.create({
    textInputContainer: {
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'black',
    },
    visibilityIcon: {
        paddingRight: 12,
        height: '100%',
        justifyContent: 'center',
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 12,
        fontSize: 14,
        fontWeight: 'normal',
        color: 'black',
        paddingVertical: 0,
        height: '100%',
    },
});
