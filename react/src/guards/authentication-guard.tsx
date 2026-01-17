import {withAuthenticationRequired} from "react-oidc-context";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const AuthenticationGuard = ({ component }) => {
  const Component = withAuthenticationRequired(component, {});

  // eslint-disable-next-line react-hooks/static-components
    return <Component />;
};
