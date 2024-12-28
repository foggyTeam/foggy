"use client";

import React, { use, useEffect } from "react";
import { Button, Form, Input } from "@nextui-org/react";
import { addNewPet, getPetById } from "@/app/utils/services/loginService";

export default function Login(data) {
  const [submitted, setSubmitted] = React.useState(null);
  addNewPet("Samantha", "dog", 5).finally();
  getPetById(5).then((pet) => console.log(pet.name, pet.category.name, pet.id));

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
          placeholder="Enter your email"
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
}
