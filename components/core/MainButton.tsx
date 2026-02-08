import cn, { ClassValue } from '@/utils/cn.util';
import { cva, VariantProps } from 'class-variance-authority';
import { ReactNode } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';

export const buttonVariants = cva('flex flex-row p-4', {
	variants: {
		color: {
			black: 'bg-core-black',
			transparent: 'bg-black/0',
			yellow: 'bg-core-yellow',
			white: 'bg-core-white',
			gray: 'bg-core-white-600',
		},
		radius: {
			rounded: 'rounded-full',
			base: 'rounded-lg',
		},
		border: {
			none: '',
			base: 'border-[0.5px]',
		},
		align: {
			left: 'justify-start',
			center: 'justify-center',
			right: 'justify-end',
			normal: 'justify-normal',
		},
	},
	defaultVariants: {
		color: 'black',
		align: 'center',
		radius: 'base',
		border: 'none',
	},
});

type Props = {
	children: ReactNode;
	isLoading?: boolean;
	isDisabled?: boolean;
	className?: ClassValue;
	onPress: () => void;
} & VariantProps<typeof buttonVariants>;

const MainButton = ({
	onPress,
	children,
	className,
	isDisabled,
	isLoading,
	radius,
	align,
	color,
	border,
}: Props) => {
	return (
		<Pressable
			onPress={onPress}
			disabled={isDisabled}
			className={cn(buttonVariants({ color, align, radius, border }), className)}
		>
			{isLoading ? <ActivityIndicator /> : children}
		</Pressable>
	);
};

export default MainButton;
