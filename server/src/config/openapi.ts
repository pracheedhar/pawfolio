type JsonSchema = Record<string, unknown>;
const str = { type: 'string' };
const fields: Record<string, Record<string, JsonSchema>> = {
  categories: {
    id: str,
    title: str,
    image: str,
    path: { enum: ['/vets', '/training', '/grooming'] },
  },
  services: {
    id: str,
    name: str,
    image: str,
    category: str,
    price: { type: 'integer', minimum: 0, description: 'Price in cents' },
  },
  posts: { image: str, caption: str },
  bookings: {
    service: str,
    ownerName: str,
    phoneNumber: str,
    email: { type: 'string', format: 'email' },
    date: { type: 'string', format: 'date' },
    time: { type: 'string', example: '10:00 AM' },
  },
  notifications: { title: str, desc: str, read: { type: 'boolean' } },
};
const envelope = {
  type: 'object',
  required: ['success', 'message', 'data'],
  properties: { success: { type: 'boolean' }, message: str, data: {} },
};
const response = (description: string) => ({
  description,
  content: { 'application/json': { schema: envelope } },
});
const responses = {
  200: response('Success'),
  400: response('Validation error'),
  401: response('Authentication required'),
  403: response('Forbidden'),
  404: response('Not found'),
  409: response('Conflict'),
  429: response('Rate limited'),
};
const security = [{ cookieAuth: [] }];
const body = (
  properties: Record<string, JsonSchema>,
  required: string[] = Object.keys(properties),
) => ({
  required: true,
  content: {
    'application/json': {
      schema: { type: 'object', additionalProperties: false, properties, required },
    },
  },
});
const idParameter = { name: 'id', in: 'path', required: true, schema: str };
const paths: Record<string, unknown> = {};
for (const [name, properties] of Object.entries(fields)) {
  const catalog = ['categories', 'services'].includes(name);
  paths[`/api/v1/${name}`] = {
    get: {
      tags: [name],
      summary: `List ${name}${catalog ? ' (public)' : ' belonging to current user'}`,
      security: catalog ? [] : security,
      parameters: ['page', 'limit', 'search', ...(name === 'services' ? ['category'] : [])].map(
        (key) => ({
          name: key,
          in: 'query',
          schema: { type: ['page', 'limit'].includes(key) ? 'integer' : 'string' },
        }),
      ),
      responses,
    },
    post: {
      tags: [name],
      summary: `Create ${name}${catalog ? ' (admin only)' : ''}`,
      security,
      requestBody: body(
        properties,
        Object.keys(properties).filter((key) => !['caption', 'read'].includes(key)),
      ),
      responses: { ...responses, 201: response('Created') },
    },
  };
  const patchProperties = { ...properties };
  delete patchProperties.id;
  if (name === 'bookings') {
    delete patchProperties.service;
    patchProperties.status = { enum: ['cancelled'] };
  }
  paths[`/api/v1/${name}/{id}`] = {
    get: { tags: [name], security: catalog ? [] : security, parameters: [idParameter], responses },
    patch: {
      tags: [name],
      summary: catalog ? 'Administrator update' : 'Owner update',
      security,
      parameters: [idParameter],
      requestBody: body(patchProperties, []),
      responses,
    },
    delete: {
      tags: [name],
      summary: catalog ? 'Administrator delete' : 'Owner delete',
      security,
      parameters: [idParameter],
      responses,
    },
  };
}
for (const mode of ['register', 'login'])
  paths[`/api/v1/auth/${mode}`] = {
    post: {
      tags: ['auth'],
      requestBody: body({
        ...(mode === 'register' ? { name: str } : {}),
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8, maxLength: 72 },
      }),
      responses: { ...responses, 201: response('Registered; httpOnly token cookie set') },
    },
  };
paths['/api/v1/auth/logout'] = { post: { tags: ['auth'], responses } };
paths['/api/v1/auth/me'] = { get: { tags: ['auth'], security, responses } };
paths['/api/v1/users/me'] = {
  get: { security, responses },
  patch: { security, requestBody: body({ name: str, avatar: str, bio: str }, []), responses },
  delete: { security, responses },
};
paths['/api/v1/services/{id}/availability'] = {
  get: {
    parameters: [
      idParameter,
      { name: 'date', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
    ],
    responses,
  },
};
paths['/api/v1/bookings/{id}/payment'] = {
  post: {
    summary: 'Demo confirmation only; disabled in production; never send card details',
    security,
    parameters: [idParameter],
    responses: { ...responses, 201: response('Demo confirmation created') },
  },
};
paths['/api/v1/posts/{id}/like'] = {
  post: {
    summary: 'Toggle like on own profile post',
    security,
    parameters: [idParameter],
    responses,
  },
};
paths['/api/v1/notifications/read-all'] = { patch: { security, responses } };
for (const resource of ['uploads', 'payments']) {
  paths[`/api/v1/${resource}`] = { get: { security, responses } };
  paths[`/api/v1/${resource}/{id}`] = {
    get: { security, parameters: [idParameter], responses },
    ...(resource === 'uploads'
      ? { delete: { security, parameters: [idParameter], responses } }
      : {}),
  };
}
(paths['/api/v1/uploads'] as Record<string, unknown>).post = {
  security,
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          required: ['image'],
          properties: { image: { type: 'string', format: 'binary' } },
        },
      },
    },
  },
  responses: { ...responses, 201: response('Image uploaded') },
};
paths['/api/health'] = {
  get: {
    responses: { 200: response('Database connected'), 503: response('Database unavailable') },
  },
};
export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Pawfolio API',
    version: '1.0.0',
    description:
      'Amounts are integer USD cents. Cookie auth; catalog writes require admin. Profile resources require ownership. Payments are development demonstrations only. Appointment times use the server timezone.',
  },
  components: { securitySchemes: { cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' } } },
  paths,
};
