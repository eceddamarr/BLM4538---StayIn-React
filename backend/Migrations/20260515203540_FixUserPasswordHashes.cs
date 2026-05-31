using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StayinApi.Migrations
{
    /// <inheritdoc />
    public partial class FixUserPasswordHashes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 6,
                column: "PasswordHash",
                value: "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 7,
                column: "PasswordHash",
                value: "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 8,
                column: "PasswordHash",
                value: "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 9,
                column: "PasswordHash",
                value: "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 10,
                column: "PasswordHash",
                value: "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 12,
                column: "PasswordHash",
                value: "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 13,
                column: "PasswordHash",
                value: "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 14,
                column: "PasswordHash",
                value: "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 6,
                column: "PasswordHash",
                value: "$2a$11$YDP1TBsuqNJE/...");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 7,
                column: "PasswordHash",
                value: "$2a$11$01dlxOb7117Pu5d6ld5P5urNCitk4...");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 8,
                column: "PasswordHash",
                value: "$2a$11$z3u8gFxSOMyzL8x1UeaPnuB...");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 9,
                column: "PasswordHash",
                value: "$2a$11$2jguMGKJ4fyp26LoAxZIeWPghkjg...");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 10,
                column: "PasswordHash",
                value: "$2a$11$9J2xe2hWzIoNYZ35xOLLFeBOYa8WH...");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 12,
                column: "PasswordHash",
                value: "$2a$11$S86nSjMKVzXzCAs3PoKcYe/...");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 13,
                column: "PasswordHash",
                value: "$2a$11$hS2w/...");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 14,
                column: "PasswordHash",
                value: "$2a$11$s9p7xB6vEsj3DRpmFqoLPOEmYVzY0...");
        }
    }
}
