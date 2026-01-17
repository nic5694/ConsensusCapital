import {callExternalApi} from "./externalApi.ts";

const apiServerUrl = import.meta.env.VITE_REACT_APP_API_SERVER_URL;


export const getProfile = async (accessToken : string) => {
    const config = {
        url: `${apiServerUrl}/api/v1/profile/private`,
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