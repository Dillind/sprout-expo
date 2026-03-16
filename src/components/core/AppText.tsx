import { FONTS } from "@/src/constants/theme";
import cn, { ClassValue } from "@/src/utils/cn.util";
import { cva, VariantProps } from "class-variance-authority";
import { ComponentProps, ReactNode } from "react";
import { Text } from "react-native";

export const textVariants = cva("", {
  variants: {
    color: {
      black: "text-core-black",
      white: "text-core-white",
      white100: "text-core-white-1000",
      black80: "text-core-black-800",
      gray: "text-core-black-600",
      lightGray: "text-core-black-400",
      red: "text-red-500",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      md: "text-lg",
      lg: "text-2xl",
      xl: "text-4xl",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    transform: {
      none: "normal-case",
      uppercase: "uppercase",
    },
    font: {
      light: FONTS.InterLight,
      base: FONTS.InterRegular,
      medium: FONTS.InterRegular,
      semiBold: FONTS.InterRegular,
      bold: FONTS.InterRegular,
    },
  },
  defaultVariants: {
    color: "black",
    size: "sm",
    align: "left",
    transform: "none",
    font: "base",
  },
});

type Props = {
  className?: ClassValue;
  children?: ReactNode;
} & VariantProps<typeof textVariants> &
  Omit<ComponentProps<typeof Text>, "className">;

const AppText = ({
  className,
  children,
  font,
  color,
  size,
  align,
  transform,
  ...props
}: Props) => {
  return (
    <Text
      textBreakStrategy="simple"
      lineBreakStrategyIOS="standard"
      className={cn(
        textVariants({
          font,
          color,
          size,
          align,
          transform,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </Text>
  );
};

export default AppText;