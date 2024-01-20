"use client";

import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/input";

import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthFormValidation } from "@/app/hooks/useAuthFormValidation";

type Variant = "LOGIN" | "REGISTER" | "RESET_PASSWORD" | "ANSWER";

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);
  const [secretQuestion, setSecretQuestion] = useState("");
  const [readyToAnswer, setReadyToAnswer] = useState(false);

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/users");
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");

    } else {
      setVariant("LOGIN");
    }
    setReadyToAnswer(false);
  }, [variant]);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
  } = useForm<FieldValues>({
    mode: "all",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      secretQuestion: "",
      secretAnswer: "",
    },
  });

  const { validateLogin, validatePassword, validatePasswordMatch } =
    useAuthFormValidation();

  const areAllFieldsTouched = (variant: any, touchedFields: any) => {
    let fields =
      variant === "REGISTER"
        ? ["email", "password", "confirmPassword", "name"]
        : ["email", "password"];

    if (variant === "RESET_PASSWORD") {
      fields = ["email"];
    }

    return fields.every((field) => touchedFields[field]);
  };

  const changePassword = async (data: any) => {
    try {
      
      const response = await axios.post('api/reset' , data);
      console.log(data.password);
      toast.success("Password changed succesfully!");
      setVariant("LOGIN");
      setReadyToAnswer(false);
    } catch (error) {
      toast.error("Error changing password")
    } finally {
      console.log(data)
    }
  }

  const fetchSecretQuestion = async (email: string) => {
    try {
      const response = await axios.get(`/api/secret?email=${email}`);
      setSecretQuestion(response.data.secretQuestion);

      setReadyToAnswer(true);
    } catch (error) {
      toast.error("Error fetching secret question");
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    if (variant === "ANSWER") {
      await changePassword(data)
    } else
    if (variant === "RESET_PASSWORD") {
      console.log(data.email);
      await fetchSecretQuestion(data.email);

      console.log(secretQuestion);
    } else {
      if (!validateLogin(data.email)) {
        toast.error(
          "Login must be 6-20 characters and start with a letter. Allowed characters: letters, numbers, hyphens, underscores, dots."
        );
      } else if (!validatePassword(data.password)) {
        toast.error(
          "Password must be 6-20 characters and start with a letter. Allowed characters: letters, numbers, hyphens, underscores, dots."
        );
      } else {
        if (variant === "REGISTER") {
          if (!validateLogin(data.email)) {
            toast.error(
              "Login must be 6-20 characters and start with a letter. Allowed characters: letters, numbers, hyphens, underscores, dots."
            );
          } else if (!validatePassword(data.password)) {
            toast.error(
              "Password must be 6-20 characters and start with a letter. Allowed characters: letters, numbers, hyphens, underscores, dots."
            );
          } else if (
            !validatePasswordMatch(data.password, data.confirmPassword)
          ) {
            toast.error("Passwords dont match");
          } else {
            console.log(data);
            axios
              .post("/api/register", data)
              .then(() => signIn("credentials", data))
              .catch(() => {
                if (
                  data.name &&
                  data.email &&
                  data.password &&
                  data.secretQuestion &&
                  data.secretAnswer
                ) {
                  toast.error("Something went wrong");
                } else {
                  toast.error("Fill all fields, please");
                }
              })
              .finally(() => setIsLoading(false));
          }
        }

        if (variant === "LOGIN") {
          signIn("credentials", {
            ...data,
            redirect: false,
          })
            .then((callback) => {
              if (callback?.error) {
                if (!data.email) {
                  toast.error("Login required");
                } else if (!data.password) {
                  toast.error("Password required");
                } else {
                  toast.error("Invalid credentials");
                }
                console.log(data);
              }
              if (callback?.ok && !callback?.error) {
                toast.success("Logged in");
                router.push("/users");
              }
            })
            .finally(() => setIsLoading(false));
        }
      }
    }
    if (readyToAnswer) {
      changePassword(data);
    }

    setIsLoading(false);
  };
 
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        className="
        bg-white
          px-4
          py-8
          shadow
          sm:rounded-lg
          sm:px-10
        "
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant !== "RESET_PASSWORD"  && (
            <>
              {variant === "REGISTER" && (
                <Input
                  disabled={isLoading}
                  register={register}
                  errors={errors}
                  id="name"
                  label="Name"
                />
              )}
              <Input
                disabled={isLoading}
                register={register}
                errors={errors}
                id="email"
                label="Login"
                type="login"
              />
              <Input
                disabled={isLoading}
                register={register}
                errors={errors}
                id="password"
                label="Password"
                type="password"
                
              />

              {variant === "REGISTER" && (
                <div className="mt-8 space-y-4 ">
                  <Input
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    id="confirmPassword"
                    label="Password"
                    type="password"
                  />
                  <label
                    htmlFor="secretQuestion"
                    id="secret-question-label"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Secret Question
                  </label>
                  <select
                    disabled={isLoading}
                    {...register("secretQuestion")}
                    id="secretQuestion"
                    className="
                mt-1
                block
                w-full
                py-2
                px-3
                border
                border-gray-300
                bg-white
                rounded-md
                shadow-sm
                focus:outline-none
                focus:ring-indigo-500
                focus:border-indigo-500
                sm:text-sm
              "
                  >
                    <option value="School_Number">School_Number</option>
                    <option value="Dogs_Name">Dogs_Name</option>
                  </select>
                  {errors.secretQuestion && (
                    <p
                      className="mt-2 text-sm text-red-600"
                      id="secretQuestion-error"
                    >
                      This field is required.
                    </p>
                  )}
                  <Input
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    id="secretAnswer"
                    label="Answer"
                    type="secret-question-answer"
                  />
                </div>
              )}
              <div>
                <Button
                  fullWidth
                  type="submit"
                  disabled={
                    isLoading || !areAllFieldsTouched(variant, touchedFields)
                  }
                >
                  {variant === "LOGIN" ? "Sign in" : "Register"}
                </Button>
              </div>
            </>
          )}
          {variant === "RESET_PASSWORD" && (
            <>
              <Input
                disabled={isLoading}
                register={register}
                errors={errors}
                id="email"
                label="Login"
                type="login"
              />

             <Button fullWidth type="submit" disabled={isLoading}>
                Get Secret Question
              </Button>

              <div className="mt-4">
                <label
                  htmlFor="secretQuestionDisplay"
                  className="block text-sm font-medium text-gray-700"
                >
                  Secret Question
                </label>
                <span
                  id="secretQuestionDisplay"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {secretQuestion}
                </span>
              </div>
              <Input
                disabled={isLoading}
                register={register}
                errors={errors}
                id="secretAnswer"
                label="Answer"
                type="text"
              />
              <Input
                disabled={isLoading}
                register={register}
                errors={errors}
                id="newPassword"
                label="Password"
                type="password"
              />
              <Input
                disabled={isLoading}
                register={register}
                errors={errors}
                id="passwordConfirm"
                label="Confirm password"
                type="password"
              />
              <Button fullWidth type="submit" disabled={isLoading}>
                Confirm
              </Button>
            </>
          )}
        </form>

        <div className="mt-6">
          <div className="relative">
            <div
              className="
                absolute 
                inset-0 
                flex 
                items-center
              "
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500"></span>
            </div>
          </div>
        </div>
        <div
          className="
            flex 
            gap-2 
            justify-center 
            text-sm 
            mt-6 
            px-2 
            text-gray-500
          "
        >
          <div>
            {variant === "LOGIN"
              ? "New to Messenger?"
              : "Already have an account?"}
          </div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === "LOGIN" ? "Create an account" : "Login"}
          </div>
        </div>
        <div
          className="
        flex 
        gap-2 
        justify-center 
        text-sm 
        mt-6 
        px-2 
        text-gray-500
      "
        >
          <div
            onClick={() => setVariant("RESET_PASSWORD")}
            className="underline cursor-pointer"
          >
            Reset Password
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
