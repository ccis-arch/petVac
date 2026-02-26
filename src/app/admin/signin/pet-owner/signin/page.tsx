import SigninComponent from "@/components/Signin";
import Redirect from "@/utils/Redirect";

export default function SignIn() {
  return (
    <Redirect>
      <SigninComponent />
    </Redirect>
  );
}
