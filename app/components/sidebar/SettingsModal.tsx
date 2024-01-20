"use client";

import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../Modal";
import Input from "../inputs/input";
import Image from "next/image";
import { CldUploadButton } from "next-cloudinary";
import Button from "../Button";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { useSession } from "next-auth/react";

type Variant = "CHANGE" | "NOTCHANGE";

interface SettingModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentUser: User;
}

const SettingModal: React.FC<SettingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [variant, setVariant] = useState<Variant>("NOTCHANGE");
  const [secretQuestion, setSecretQuestion] = useState("");
  const email = currentUser.email;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: currentUser?.name,
      image: currentUser?.image,
    },
  });

  const image = watch("image");

  const fetchSecretQuestion = async () => {
    try {
      const response = await axios.get(`/api/secret?email=${email}`);
      setSecretQuestion(response.data.secretQuestion);
    } catch (error) {
      toast.error("Error fetching secret question");
    }
  };
  const toggleVariant = useCallback(() => {
    if (variant === "CHANGE") {
      setVariant("NOTCHANGE");
    } else {
      console.log(`Email: ${currentUser.email}`);
      fetchSecretQuestion();
      setVariant("CHANGE");
    }
  }, [variant]);

  const handleUpload = (result: any) => {
    setValue("image", result?.info?.secure_url, {
      shouldValidate: true,
    });
  };

  const changePassword = async (data: any) => {
    try {
      data.email = email;
      const response = await axios.post('api/reset' , data);
      console.log(data.password);
      toast.success("Password changed succesfully!");
      setVariant("NOTCHANGE");
      
    } catch (error) {
      toast.error("Error changing password")
    } finally {
      console.log(data)
      setIsLoading(false);
    }
  }

  const onSubmit: SubmitHandler<FieldValues> = (data) => {

    if (variant === "CHANGE") {
      setIsLoading(true);
      changePassword(data);
    } else if (variant === "NOTCHANGE") {
      setIsLoading(true);
      axios
        .post("api/settings", data)
        .then(() => {
          router.refresh();
          onClose();
        })
        .catch(() => toast.error("Something went wrong..."))
        .finally(() => setIsLoading(false));
    }

    
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {variant === "NOTCHANGE" && (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-12">
              <div className="border-b border-graay-900/10 pb-12">
                <h2
                  className="
                    text-base
                    font-semibold
                    loading-7
                    text-gray-900
                    "
                >
                  Profile
                </h2>
                <p className="mt-1 text-sm loading-6 text-gray-600">
                  Edit your information
                </p>
                <div
                  className="
                    mt-10
                    flex
                    flex-col
                    gap-y-8
                    "
                >
                  <Input
                    disabled={isLoading}
                    label="Name"
                    id="name"
                    errors={errors}
                    required
                    register={register}
                  />
                  <div>
                    <label
                      className="
                            block
                            text-sm
                            font-medium
                            loading-6
                            text-gray-900
                            "
                    >
                      Photo
                    </label>

                    <div
                      className="
                            mt-2
                            flex
                            items-center
                            gap-x-3
                            "
                    >
                      <Image
                        width="48"
                        height="48"
                        className="rounded-full"
                        src={
                          image ||
                          currentUser?.image ||
                          "/images/placeholder.jpg"
                        }
                        alt="Avatar"
                      />
                      <CldUploadButton
                        options={{ maxFiles: 1, cropping: true }}
                        onUpload={handleUpload}
                        uploadPreset="cbzsf8ix"
                      >
                        <Button disabled={isLoading} secondary type="button">
                          Change
                        </Button>
                      </CldUploadButton>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="
          mt-6
          flex
          items-center
          justify-end
          gap-x-6
          "
              >
                <Button
                  disabled={isLoading}
                  secondary
                  type="button"
                  onClick={toggleVariant}
                >
                  Change password
                </Button>
                <Button disabled={isLoading} secondary onClick={onClose}>
                  Cancel
                </Button>
                <Button disabled={isLoading} type="submit">
                  Save
                </Button>
              </div>
            </div>
          </form>
        </>
      )}
      {variant === "CHANGE" && (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-1">
                <h2
                  className="
          text-base
          font-semibold
          loading-7
          text-gray-900
          "
                >
                  Change Password
                </h2>
                <h5
                  className="
          text-base
          font-semibold
          loading-7
          text-gray-600
          mt-10
          "
                >
                  Your secret question: {secretQuestion}
                </h5>
                <div
                  className="
          mt-5
          flex
          flex-col
          gap-y-8
          "
                >
                  <Input
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    id="secretAnswer"
                    label="Your answer"
                  />
                  <Input
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    id="newPassword"
                    label="Password"
                  />
                  <Input
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    id="confirmPassword"
                    label="Confirm Paswword"
                  />
                  <div>
                    <div
                      className="
                  mt-0
                  flex
                  items-center
                  gap-x-3
                  "
                    ></div>
                  </div>
                </div>
              </div>

              <div
                className="
mt-1
flex
items-center
justify-end
gap-x-6
"
              >
                <Button disabled={isLoading} secondary onClick={toggleVariant}>
                  Cancel
                </Button>
                <Button disabled={isLoading} type="submit">
                  Save
                </Button>
              </div>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
};

export default SettingModal;
