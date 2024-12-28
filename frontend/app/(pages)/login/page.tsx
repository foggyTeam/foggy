"use client";

import React from "react";
import { Button, Form, Input } from "@nextui-org/react";
import petStore from "@/app/stores/petStore";
import { observer } from "mobx-react-lite";
import { useCurrentPet } from "@/app/hooks/useCurrentPet";

const Login = React.memo(
  observer(() => {
    const [submitted, setSubmitted] = React.useState(null);
    const id = 5;

    const { data, error } = useCurrentPet(id);

    if (error) {
      return <div>{petStore.error}</div>;
    }

    const onSubmit = (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(e.currentTarget));

      setSubmitted(data);
    };

    return (
      <div className={"flex justify-center m-64"}>
        <Form
          className="w-full max-w-xs"
          validationBehavior="native"
          onSubmit={onSubmit}
        >
          <Input
            isRequired
            errorMessage="Please enter a valid email"
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder={
              petStore.currentPet ? petStore.currentPet.name : "Pet name..."
            }
            type="email"
          />
          <Button type="submit" variant="bordered" color="primary">
            Submit
          </Button>
          {submitted && (
            <div className="text-small text-default-500">
              You submitted: <code>{JSON.stringify(submitted)}</code>
            </div>
          )}
        </Form>
      </div>
    );
  }),
);

export default Login;
