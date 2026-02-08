import cn, { ClassValue } from "@/utils/cn.util";
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
      base: "Ivy-Presto-Text",
      medium: "Ivy-Presto-Thin",
      semiBold: "Ivy-Presto-Light",
      bold: "Ivy-Presto-Semi-Bold",
      black: "Ivy-Presto-Text",
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
  twClassName?: ClassValue;
  children?: ReactNode;
} & VariantProps<typeof textVariants> &
  Omit<ComponentProps<typeof Text>, "className">;

const AppText = ({
  twClassName,
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
        twClassName
      )}
      {...props}
    >
      {children}
    </Text>
  );
};

export default AppText;