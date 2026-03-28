import AppText from '@/src/components/core/AppText';
import React from 'react';

type Props = {
    error?: string;
};

const FieldError = ({ error }: Props) => {
    if (!error) return null;

    return <AppText className="text-red-500 text-sm mt-1">{error}</AppText>;
};

export default FieldError;
