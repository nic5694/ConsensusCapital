import {callExternalApi} from "./externalApi.ts";

const apiServerUrl = import.meta.env.VITE_REACT_APP_API_SERVER_URL;


export const getPortfolio = async (accessToken : string) => {
    const config = {
        url: `${apiServerUrl}/api/v1/portfolios`,
        method: "GET",
        headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    };

    const { data, error } = await callExternalApi({ config });

    console.log(data);

    return {
        data: data || null,
        error,
    };
};

export const createPortfolio = async (accessToken : string) => {
    const config = {
        url: `${apiServerUrl}/api/v1/portfolios`,
        method: "POST",
        headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    };

    await callExternalApi({ config });
}