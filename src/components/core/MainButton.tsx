import cn, { ClassValue } from '@/src/utils/cn.util';
import { cva, VariantProps } from 'class-variance-authority';
import { type Href, Link } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import AppText from './AppText';

const buttonVariants = cva(
    'flex-row items-center justify-center rounded-full',
    {
        variants: {
            variant: {
                primary: 'bg-core-primary shadow-md',
                secondary: 'bg-white border border-core-black-200',
                text: 'bg-transparent',
            },
            size: {
                xs: 'px-3 py-2 min-w-[88px]',
                sm: 'px-[18px] py-3',
                md: 'px-6 py-3',
                lg: 'px-10 py-3',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

const textColorMap = {
    primary: 'white',
    secondary: 'black',
    text: 'black',
} as const satisfies Record<
    NonNullable<VariantProps<typeof buttonVariants>['variant']>,
    'white' | 'black'
>;

const textSizeMap = {
    xs: 'xs',
    sm: 'sm',
    md: 'base',
    lg: 'md',
} as const satisfies Record<
    NonNullable<VariantProps<typeof buttonVariants>['size']>,
    'xs' | 'sm' | 'base' | 'md'
>;

type MainButtonProps = {
    text: string;
    className?: ClassValue;
    isLoading?: boolean;
    onPress?: () => void;
    href?: Href;
    isDisabled?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
} & VariantProps<typeof buttonVariants>;

const MainButton = ({
    text,
    className,
    onPress,
    href,
    isLoading,
    isDisabled,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
}: MainButtonProps) => {
    const resolvedVariant = variant ?? 'primary';
    const resolvedSize = size ?? 'md';
    const textColor = textColorMap[resolvedVariant];
    const textSize = textSizeMap[resolvedSize];
    const buttonClass = cn(
        buttonVariants({ variant, size }),
        isDisabled && 'opacity-50',
        className
    );

    const content = (
        <>
            {leftIcon && !isLoading && leftIcon}
            {isLoading && <ActivityIndicator className="mr-1" />}
            <AppText size={textSize} color={textColor} font="bold">
                {text}
            </AppText>
            {rightIcon && !isLoading && rightIcon}
        </>
    );

    if (href) {
        return (
            <Link href={href} asChild disabled={isDisabled}>
                <Pressable className={buttonClass} onPress={onPress}>
                    {content}
                </Pressable>
            </Link>
        );
    }

    if (onPress) {
        return (
            <Pressable onPress={onPress} disabled={isDisabled} className={buttonClass}>
                {content}
            </Pressable>
        );
    }

    return null;
};

export default MainButton;
