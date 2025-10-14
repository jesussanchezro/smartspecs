import { Timestamp } from "firebase/firestore";
import { toISODate } from "../firestoreTimeStamps";

describe("firestoreTimeStamps", () => {
  describe("toISODate", () => {
    it("should convert Firestore Timestamp to ISO string", () => {
      const timestamp = Timestamp.fromDate(new Date("2024-01-15T10:30:00.000Z"));
      const result = toISODate(timestamp);
      
      expect(result).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should convert Date object to ISO string", () => {
      const date = new Date("2024-01-15T10:30:00.000Z");
      const result = toISODate(date);
      
      expect(result).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should convert valid date string to ISO string", () => {
      const dateString = "2024-01-15T10:30:00.000Z";
      const result = toISODate(dateString);
      
      expect(result).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should convert valid date string in different format to ISO string", () => {
      const dateString = "2024-01-15";
      const result = toISODate(dateString);
      
      expect(result).toBe("2024-01-15T00:00:00.000Z");
    });

    it("should return current date ISO string for invalid string", () => {
      const invalidString = "invalid-date";
      const result = toISODate(invalidString);
      const currentDate = new Date();
      
      // Check that the result is a valid ISO string and close to current time
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      const resultDate = new Date(result);
      const timeDiff = Math.abs(currentDate.getTime() - resultDate.getTime());
      
      // Should be within 1 second of current time
      expect(timeDiff).toBeLessThan(1000);
    });

    it("should return current date ISO string for number", () => {
      const numberValue = 12345;
      const result = toISODate(numberValue);
      const currentDate = new Date();
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      const resultDate = new Date(result);
      const timeDiff = Math.abs(currentDate.getTime() - resultDate.getTime());
      
      expect(timeDiff).toBeLessThan(1000);
    });

    it("should return current date ISO string for null", () => {
      const result = toISODate(null);
      const currentDate = new Date();
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      const resultDate = new Date(result);
      const timeDiff = Math.abs(currentDate.getTime() - resultDate.getTime());
      
      expect(timeDiff).toBeLessThan(1000);
    });

    it("should return current date ISO string for undefined", () => {
      const result = toISODate(undefined);
      const currentDate = new Date();
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      const resultDate = new Date(result);
      const timeDiff = Math.abs(currentDate.getTime() - resultDate.getTime());
      
      expect(timeDiff).toBeLessThan(1000);
    });

    it("should warn to console for unrecognized values", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      
      toISODate("invalid-date");
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "Valor no reconocido en toISODate:",
        "invalid-date"
      );
      
      consoleSpy.mockRestore();
    });
  });
});

