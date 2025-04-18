import z, { ZodObject } from 'zod';

export default function IsFormValid(
  data: any,
  schema: ZodObject<any>,
  setErrors: any,
) {
  try {
    schema.parse(data);
    setErrors({});
    return true;
  } catch (e) {
    if (e instanceof z.ZodError) {
      const newErrors: any = {};
      e.errors.forEach((error) => {
        if (error.path.length > 0) {
          newErrors[error.path[0]] = error.message;
        }
      });
      setErrors(newErrors);
    }
    return false;
  }
}
