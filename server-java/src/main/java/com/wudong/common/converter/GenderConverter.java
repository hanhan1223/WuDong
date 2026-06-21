package com.wudong.common.converter;

import com.wudong.common.enums.Gender;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class GenderConverter implements AttributeConverter<Gender, Integer> {

    @Override
    public Integer convertToDatabaseColumn(Gender attribute) {
        if (attribute == null) {
            return Gender.UNKNOWN.getValue();
        }
        return attribute.getValue();
    }

    @Override
    public Gender convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return Gender.UNKNOWN;
        }
        for (Gender gender : Gender.values()) {
            if (gender.getValue() == dbData) {
                return gender;
            }
        }
        return Gender.UNKNOWN;
    }
}
