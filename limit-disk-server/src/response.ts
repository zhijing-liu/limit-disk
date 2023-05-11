const responseMap: {
  [key: string]: {
    [key: string]: {
      [key: string]: {
        result: boolean;
        message?: string;
      };
    };
  };
} = {
  'file-system': {
    'disk-character': {
      s1: {
        result: true,
      },
    },
    'get-dir-info': {
      s1: {
        result: true,
      },
    },
    'get-dir': {
      s1: {
        result: true,
      },
      e1: {
        result: false,
        message: '查询错误',
      },
    },
    'collect-path': {
      s1: {
        result: true,
      },
    },
    'add-collect-path': {
      s1: {
        result: true,
      },
      s2: {
        result: true,
        message: '路径已存在',
      },
    },
    'upload-files': {
      s1: {
        result: true,
      },
    },
    'remove-items': {
      s1: {
        result: true,
      },
    },
  },
};
export const response = async <T = any>(
  controller: string,
  path: string,
  code: string,
  data?: T | Promise<T>,
): Promise<{
  result: boolean;
  trace: string;
  message?: string;
  data?: T;
  err?: string;
}> => {
  const trace = `${controller}/${path}/${code}`;
  try {
    return {
      ...responseMap[controller][path][code],
      data: await data,
      trace,
    };
  } catch (err) {
    return {
      result: false,
      message: '未定义的code',
      data: await data,
      trace,
      err,
    };
  }
};
