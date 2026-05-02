import z from 'zod';
import settingsStore from '../../stores/settingsStore';

const nicknameRegex = /^[a-zA-Z][a-zA-Z0-9._-]*$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;
const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9._]+\.[a-zA-Z]{2,}$/;
const aboutRegex =
  /^[a-zA-Zа-яА-Я0-9 .,!?\-_:;()@#&%$*+=\[\]{}<>|\/\\\u1F600-\u1F64F\u1F300-\u1F5FF\u1F680-\u1F6FF\u1F700-\u1F77F\u1F780-\u1F7FF\u1F800-\u1F8FF\u1F900-\u1F9FF\u1FA00-\u1FA6F\u1FA70-\u1FAFF\u2600-\u26FF\u2700-\u27BF]*$/;

const urlRegex =
  /^https?:\/\/([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+(:\d+)?(\/[^\s]*)?(\?[^\s]*)?$/;
const nodeToNodeLinkRegex = /\/project\/[a-f0-9]+\/[a-f0-9]+\/[a-f0-9]+\/graph/;

export const loginFormSchema = z.object({
  email: z
    .string()
    .nonempty(settingsStore.t.validationErrors.email.required)
    .max(100, settingsStore.t.validationErrors.email.maxLength)
    .email(settingsStore.t.validationErrors.email.invalidEmail)
    .regex(emailRegex, settingsStore.t.validationErrors.email.invalidSymbols),

  password: z
    .string()
    .nonempty(settingsStore.t.validationErrors.password.required)
    .min(8, settingsStore.t.validationErrors.password.minLength)
    .max(20, settingsStore.t.validationErrors.password.maxLength)
    .regex(
      passwordRegex,
      settingsStore.t.validationErrors.password.invalidPassword,
    ),
});

export const profileFormSchema = z.object({
  nickname: z
    .string()
    .nonempty(settingsStore.t.validationErrors.nickname.required)
    .max(14, settingsStore.t.validationErrors.nickname.maxLength)
    .regex(
      nicknameRegex,
      settingsStore.t.validationErrors.nickname.invalidSymbols,
    ),

  email: z
    .string()
    .nonempty(settingsStore.t.validationErrors.email.required)
    .max(100, settingsStore.t.validationErrors.email.maxLength)
    .email(settingsStore.t.validationErrors.email.invalidEmail)
    .regex(emailRegex, settingsStore.t.validationErrors.email.invalidSymbols),

  about: z
    .string()
    .max(140, settingsStore.t.validationErrors.about.maxLength)
    .regex(aboutRegex, settingsStore.t.validationErrors.about.invalidSymbols),
});

export const projectFormSchema = z.object({
  name: z
    .string()
    .nonempty(settingsStore.t.validationErrors.projectName.required)
    .max(20, settingsStore.t.validationErrors.projectName.maxLength)
    .regex(
      aboutRegex,
      settingsStore.t.validationErrors.projectName.invalidSymbols,
    ),
  description: z
    .string()
    .max(300, settingsStore.t.validationErrors.projectDescription.maxLength)
    .regex(
      aboutRegex,
      settingsStore.t.validationErrors.projectDescription.invalidSymbols,
    ),
});

export const projectElementNameSchema = z.object({
  name: z
    .string()
    .nonempty(settingsStore.t.validationErrors.projectElementName.required)
    .max(20, settingsStore.t.validationErrors.projectElementName.maxLength)
    .regex(
      aboutRegex,
      settingsStore.t.validationErrors.projectElementName.invalidSymbols,
    ),
  prompt: z
    .string()
    .min(10, settingsStore.t.validationErrors.boardPrompt.minLength)
    .max(2000, settingsStore.t.validationErrors.boardPrompt.maxLength)
    .regex(
      aboutRegex,
      settingsStore.t.validationErrors.boardPrompt.invalidSymbols,
    )
    .or(z.literal(''))
    .nullish(),
});

export const teamFormSchema = z.object({
  name: z
    .string()
    .nonempty(settingsStore.t.validationErrors.teamName.required)
    .max(20, settingsStore.t.validationErrors.teamName.maxLength)
    .regex(
      aboutRegex,
      settingsStore.t.validationErrors.teamName.invalidSymbols,
    ),
});

export const requestMessageFormSchema = z.object({
  message: z
    .string()
    .max(300, settingsStore.t.validationErrors.requestMessage.maxLength)
    .regex(
      aboutRegex,
      settingsStore.t.validationErrors.requestMessage.invalidSymbols,
    ),
});

export const externalLinkNodeSchema = z.object({
  url: z
    .string()
    .max(1024, settingsStore.t.validationErrors.graphNode.maxUrlLength)
    .regex(urlRegex, settingsStore.t.validationErrors.graphNode.invalidUrl)
    .refine(
      (v) => !nodeToNodeLinkRegex.test(v),
      settingsStore.t.validationErrors.graphNode.invalidUrl,
    )
    .nullish(),
  description: z
    .string()
    .max(300, settingsStore.t.validationErrors.graphNode.maxDescriptionLength)
    .regex(
      aboutRegex,
      settingsStore.t.validationErrors.graphNode.invalidSymbols,
    )
    .nullish(),
});

export const nodeToNodeLinkSchema = z.object({
  url: z
    .string()
    .max(1024, settingsStore.t.validationErrors.graphNode.maxUrlLength)
    .regex(urlRegex, settingsStore.t.validationErrors.graphNode.invalidUrl)
    .regex(
      nodeToNodeLinkRegex,
      settingsStore.t.validationErrors.graphNode.invalidUrl,
    )
    .nullish(),
  title: z
    .string()
    .max(20, settingsStore.t.validationErrors.graphNode.maxTitleLength)
    .regex(
      aboutRegex,
      settingsStore.t.validationErrors.graphNode.invalidSymbols,
    )
    .nullish(),
});

export const customNodeSchema = z.object({
  title: z
    .string()
    .max(20, settingsStore.t.validationErrors.graphNode.maxTitleLength)
    .regex(
      aboutRegex,
      settingsStore.t.validationErrors.graphNode.invalidSymbols,
    )
    .nullish(),
  description: z
    .string()
    .max(300, settingsStore.t.validationErrors.graphNode.maxDescriptionLength)
    .regex(
      aboutRegex,
      settingsStore.t.validationErrors.graphNode.invalidSymbols,
    )
    .nullish(),
});

export const internalLinkNodeSchema = z.object({
  title: z
    .string()
    .max(20, settingsStore.t.validationErrors.graphNode.maxTitleLength)
    .regex(
      aboutRegex,
      settingsStore.t.validationErrors.graphNode.invalidSymbols,
    )
    .nullish(),
});
