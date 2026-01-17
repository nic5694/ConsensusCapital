import axios, { type AxiosRequestConfig } from "axios";

export const callExternalApi = async (options: { config: AxiosRequestConfig<never>; }) => {
    try {
        const response = await axios(options.config);
        const { data } = response;

        return {
            data,
            error: null,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error;

            const { response } = axiosError;

            let message = "http request failed";

            if (response && response.statusText) {
                message = response.statusText;
            }

            if (axiosError.message) {
                message = axiosError.message;
            }

            if (response && response.data && response.data.message) {
                message = response.data.message;
            }

            return {
                data: null,
                error: {
                    message,
                },
            };
        }

        return {
            data: null,
            error: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                message: error.message,
            },
        };
    }
};
