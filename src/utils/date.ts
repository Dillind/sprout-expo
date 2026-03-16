export namespace DateUtils {
    export const formatDateInput = (text: string) => {
        // Remove all non-digits
        const digits = text.replace(/\D/g, '');

        // Limit to 8 digits (DDMMYYYY)
        const limitedDigits = digits.slice(0, 8);

        // Format based on length
        if (limitedDigits.length <= 2) {
            return limitedDigits;
        } else if (limitedDigits.length <= 4) {
            return `${limitedDigits.slice(0, 2)}/${limitedDigits.slice(2)}`;
        } else {
            return `${limitedDigits.slice(0, 2)}/${limitedDigits.slice(2, 4)}/${limitedDigits.slice(4)}`;
        }
    };

    export const formatDateInputToISO = (dateString: string): string => {
        if (!dateString) return '';

        const [day, month, year] = dateString.split('/');
        if (day && month && year) {
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
        }
        return '';
    };

    export const formatISOToDateInput = (isoString: string): string => {
        if (!isoString) return '';

        try {
            const date = new Date(isoString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear().toString();
            return `${day}/${month}/${year}`;
        } catch {
            return '';
        }
    };
    export const formatFullDateLong = (dateString: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };
}
