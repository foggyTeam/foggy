import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { Checkbox } from '@heroui/checkbox';
import React from 'react';
import { Skeleton } from '@heroui/skeleton';

export default function ProfileFormSkeleton() {
  return (
    <div className={'flex w-[736px] min-w-24 flex-col gap-6'}>
      <div className="items-top flex w-full justify-between gap-2">
        <Skeleton className="rounded-lg">
          <Avatar size="lg" className="h-72 w-72" />
        </Skeleton>
        <Skeleton className="rounded-lg">
          <Button variant="light" size="md">
            Lorem ipsum
          </Button>
        </Skeleton>
      </div>
      <div className="flex w-full justify-between gap-6">
        <div className="flex h-fit w-full flex-col gap-2">
          <Skeleton className="rounded-lg">
            <Input labelPlacement="inside" size="md" />
          </Skeleton>
          <Skeleton className="rounded-lg">
            <Input labelPlacement="inside" size="md" />
          </Skeleton>
        </div>
        <div className="flex h-full w-full flex-col">
          <Skeleton className="rounded-lg">
            <Textarea labelPlacement="inside" size="md" />
          </Skeleton>
        </div>
      </div>
      <div className="flex w-full justify-between gap-6">
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="rounded-lg">
            <Checkbox size="sm">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            </Checkbox>
          </Skeleton>
          <Skeleton className="rounded-lg">
            <Checkbox size="sm">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            </Checkbox>
          </Skeleton>
        </div>
        <div className="flex w-full flex-col">
          <Skeleton className="rounded-lg">
            <Checkbox className="align-top" size="sm">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            </Checkbox>
          </Skeleton>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        <Skeleton className="rounded-lg">
          <Button variant="bordered" size="md">
            Lorem ipsum
          </Button>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <Button variant="solid" size="md">
            Lorem
          </Button>
        </Skeleton>
      </div>
    </div>
  );
}
