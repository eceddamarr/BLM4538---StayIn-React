using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StayinApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUsersSeeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "Favorites", "FullName", "PasswordHash", "PhoneNumber", "Role", "VerificationCode", "VerificationCodeExpires" },
                values: new object[,]
                {
                    { 6, "ece@stayin.dev", "[20,18,15]", "Ece Damar", "$2a$11$YDP1TBsuqNJE/...", "05366666666", "User", null, null },
                    { 7, "hevin@stayin.dev", "[24,2,30]", "Sevgin Açık", "$2a$11$01dlxOb7117Pu5d6ld5P5urNCitk4...", "05555555555", "User", null, null },
                    { 8, "merve@stayin.dev", "[]", "Merve Çetin", "$2a$11$z3u8gFxSOMyzL8x1UeaPnuB...", "05344444444", "User", null, null },
                    { 9, "berkay@stayin.dev", "[28]", "Berkay Yıldız", "$2a$11$2jguMGKJ4fyp26LoAxZIeWPghkjg...", "05361111111", "User", null, null },
                    { 10, "ceyda@stayin.dev", "[]", "Ceyda Demir", "$2a$11$9J2xe2hWzIoNYZ35xOLLFeBOYa8WH...", "05377777777", "User", null, null },
                    { 12, "aleyna@stayin.dev", "[]", "Aleyna Taşdemir", "$2a$11$S86nSjMKVzXzCAs3PoKcYe/...", "05441785678", "User", null, null },
                    { 13, "fatma@stayin.dev", "[]", "Fatma Demir", "$2a$11$hS2w/...", "05431234567", "User", null, null },
                    { 14, "elif@stayin.dev", "[]", "Elif Gün", "$2a$11$s9p7xB6vEsj3DRpmFqoLPOEmYVzY0...", "0565 456 77 88", "User", null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 14);
        }
    }
}
