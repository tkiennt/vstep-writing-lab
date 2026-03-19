namespace VstepWritingLab.Domain.ValueObjects;

public record Result<T>(bool IsSuccess, T? Value, string? Error)
{
    public static Result<T> Ok(T value)      => new(true,  value, null);
    public static Result<T> Fail(string err) => new(false, default, err);
}
