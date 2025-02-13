import { Button } from '@heroui/button';
import { Avatar } from '@heroui/avatar';
import { Badge } from '@heroui/badge';

export default function Main() {
  return (
    <div className="flex h-full w-full items-start justify-center gap-4 py-16">
      <div className="flex w-fit flex-col items-center justify-start gap-2">
        <Avatar isBordered className="accent-avatar" name="Junior" />
      </div>

      <div className="flex w-fit flex-col items-center justify-start gap-2">
        <Badge content="5" className="accent-badge-s">
          <Avatar name="Junior" />
        </Badge>
        <Badge content="5" className="accent-badge-fl">
          <Avatar name="Junior" />
        </Badge>
        <Badge content="5" className="accent-badge-f">
          <Avatar name="Junior" />
        </Badge>
        <Badge content="5" className="accent-badge-sh">
          <Avatar name="Junior" />
        </Badge>
      </div>

      <div className="flex w-fit flex-col items-center justify-start gap-2">
        <Button size="lg" className="accent-s">
          Foggy
        </Button>
        <Button size="lg" className="accent-f">
          Foggy
        </Button>
        <Button size="lg" className="accent-b">
          Foggy
        </Button>
        <Button size="lg" className="accent-l">
          Foggy
        </Button>
        <Button size="lg" className="accent-fl">
          Foggy
        </Button>
        <Button size="lg" className="accent-g">
          Foggy
        </Button>
        <Button size="lg" className="accent-sh">
          Foggy
        </Button>
      </div>
    </div>
  );
}
