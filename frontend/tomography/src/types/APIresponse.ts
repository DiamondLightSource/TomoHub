export type ApiMethodsSchema = {
  [modulePath: string]: {
    [methodName: string]: {
      method_name: string;
      module_path: string;
      method_desc: string;
      method_doc: string;
      parameters: {
        [key: string]: {
          type: string;
          value: any;
          desc: string;
        };
      };
    };
  };
};

export type Method = ApiMethodsSchema[string][string];

export type MethodComponentConfig = {
  methodType: string;
  fetchMethod: () => Promise<ApiMethodsSchema>;
};

export type ApiFullPipelineSchema = {
  [pipelineName: string]: {
    [methodName: string]: {
      module_path: string;
      parameters: {
        [key: string]: any;
      };
    };
  };
};
