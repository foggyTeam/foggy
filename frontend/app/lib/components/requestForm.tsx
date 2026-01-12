'use client';

import { observer } from 'mobx-react-lite';
import { Form } from '@heroui/form';
import React, { useEffect, useState } from 'react';
import { Role } from '@/app/lib/types/definitions';
import SelectRole from '@/app/lib/components/members/selectRole';
import { Textarea } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import { addToast } from '@heroui/toast';
import {
  JoinProjectRequest,
  JoinTeamRequest,
} from '@/app/lib/server/actions/notificationsServerActions';
import IsFormValid from '@/app/lib/utils/isFormValid';
import { requestMessageFormSchema } from '@/app/lib/types/schemas';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

const RequestForm = observer(
  ({ id, type }: { id: string | undefined; type: 'project' | 'team' }) => {
    const { commonSize } = useAdaptiveParams();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({} as any);

    const [message, setMessage] = useState('');
    const [role, setRole] = useState<Role | undefined>('editor');

    const [isSendDisabled, setIsSendDisabled] = useState(false);

    useEffect(() => {
      IsFormValid({ message }, requestMessageFormSchema, setErrors);
    }, [message]);

    const onSubmit = async () => {
      if (!id || !role) return;
      if (!Object.keys(errors as any).length) {
        setIsLoading(true);

        try {
          const result =
            type === 'project'
              ? await JoinProjectRequest(id, role, message)
              : await JoinTeamRequest(id, role, message);
          if (
            Object.keys(result).findIndex((element) => element === 'errors') !==
            -1
          ) {
            setErrors(result.errors);
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.joinRequest.requestError.title,
              description:
                result.errors.notification ??
                settingsStore.t.toasts.joinRequest.requestError.description,
            });
            if (result.statusCode === 409) setIsSendDisabled(true);
          } else {
            addToast({
              color: 'success',
              severity: 'success',
              title: settingsStore.t.toasts.joinRequest.requestSent.title,
              description:
                settingsStore.t.toasts.joinRequest.requestSent.description,
            });
            setIsSendDisabled(true);
          }
        } catch (e: any) {
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.joinRequest.sendRequestError,
            description: e.message,
          });
        }

        setIsLoading(false);
      }
    };

    return (
      <Form className="items-top flex w-full flex-col gap-2 py-2">
        <h1 className="flex h-10 items-center font-medium">
          {settingsStore.t.notifications.sendRequest.title}
        </h1>
        <Textarea
          isInvalid={errors.message}
          errorMessage={errors.message}
          maxRows={4}
          label={settingsStore.t.notifications.sendRequest.label}
          labelPlacement="inside"
          name="message"
          placeholder={settingsStore.t.notifications.sendRequest.placeholder}
          type="message"
          autoComplete="message"
          size={commonSize}
          value={message}
          onValueChange={setMessage}
          classNames={{
            inputWrapper: 'bg-[hsl(var(--heroui-background))]',
          }}
        />
        <SelectRole
          role={role}
          setRole={setRole}
          style="bordered"
          className="w-full"
        />

        <div className="flex w-full items-center justify-end">
          <FButton
            isLoading={isLoading}
            onPress={onSubmit}
            variant="solid"
            color="primary"
            isDisabled={isSendDisabled}
            size={commonSize}
          >
            {isSendDisabled
              ? settingsStore.t.notifications.sendRequest.alreadySentButton
              : settingsStore.t.notifications.sendRequest.sendButton}
          </FButton>
        </div>
      </Form>
    );
  },
);

export default RequestForm;
