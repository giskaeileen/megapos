import { FC } from "react";
import Select from 'react-select';

type Props = {
    attributes: any,
    setAttributes: any,
    handleRemoveRow: any,
    handleChange2: any,
    getOptions: any,
    handleAddRow: any,
    dataAttributes: any,
    data: any,
};

const ProductAttribute: FC<Props> = ({
    attributes,
    handleRemoveRow,
    handleChange2,
    getOptions,
    handleAddRow,
    dataAttributes,
    data
}) => {
    const attributeOptions = dataAttributes?.data.map((attr: any) => ({
        value: attr.name,
        label: attr.name,
    }));

    console.log(attributes)

    return (
        <div className="panel" >
            <div className="mb-5">
                <h3 className="text-lg mb-3">Attributes</h3>

                <div className="space-y-5">
                    {attributes.map((attr: any, index: number) => (
                        <div key={index}>
                            <div className="flex justify-between">
                                <label>Option {index + 1}</label>
                                <div
                                    onClick={() => handleRemoveRow(index)}
                                    className="text-danger cursor-pointer"
                                >
                                    Remove
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Attribute Name */}
                                <div className="sm:col-span-1">
                                    <label>
                                        Attribute Name
                                        <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        id="attribute_name"
                                        className="form-select"
                                        value={attr.attribute}
                                        onChange={(e) =>
                                            handleChange2(index, "attribute", e.target.value)
                                        }
                                    >
                                        <option value="">Choose...</option>
                                        {attributeOptions?.map((option: any) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Attribute Value */}
                                <div className="sm:col-span-2">
                                    <label>
                                        Attribute Value
                                        <span className="text-danger">*</span>
                                    </label>
                                    <Select
                                        placeholder="Select an option"
                                        options={getOptions(attr.attribute)}
                                        isMulti
                                        isSearchable={true}
                                        value={attr.value}
                                        onChange={(selected) =>
                                            handleChange2(index, "value", selected)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="btn btn-secondary mt-2"
                        onClick={handleAddRow}
                    >
                        Add Row
                    </button>
                </div>
            </div>
        </div>
    )
};

export default ProductAttribute;