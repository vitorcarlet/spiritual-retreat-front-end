import dayjs from "dayjs";
const Helpers = {
  objToFormData(objeto: any): FormData {
    const formData = new FormData();
    const appendToFormData = (key: string, value: any) => {
      if (value === undefined) return false;

      if (dayjs.isDayjs(value)) {
        return formData.append(key, value.toISOString());
      }

      if (value instanceof File) {
        return formData.append(key, value);
      }

      if (Array.isArray(value)) {
        return value.forEach((element, index) => {
          appendToFormData(`${key}[${index}]`, element);
        });
      }

      if (value && typeof value === "object") {
        return Object.entries(value).forEach(([subKey, subValue]) => {
          appendToFormData(`${key}[${subKey}]`, subValue);
        });
      }

      if (value === null) {
        return formData.append(key, "");
      }

      formData.append(key, value);
    };

    Object.entries(objeto).forEach(([key, value]) => {
      appendToFormData(key, value);
    });

    return formData;
  },
};

export default Helpers;
